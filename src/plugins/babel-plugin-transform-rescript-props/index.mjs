/** Visitor factory for babel, removing variable declarations from props.
 *
 * What we want to handle here is this FunctionDeclaration:
 *
 *   function Component(Props) {
 *     var text = Props.text;
 *     return ReactDOMRe.createDOMElementVariadic("div", undefined, [text]);
 *   }
 *
 * and transform it to:
 *
 *   function Component(Props) {
 *     return ReactDOMRe.createDOMElementVariadic("div", undefined, [Props.text]);
 *   }
 *
 * This is necessary to make the ReScript code compatible with libraries like solid.
 */
export default function (babel) {
  /**
   * This enables autocompletion in vs code
   * @type {{types: import("@babel/types")}}
   */
  const { types: t } = babel;

  const PARAM_NAME = "Props";

  /**
   * We are only interested in references inside a variable declaration.
   *
   * @param {import("@babel/traverse").NodePath} refPath path to the reference
   * @param {import("@babel/traverse").Scope} scope scope of the FunctionDeclaration
   * @returns path to the VariableDeclarator or null if none is found
   */
  const findRefInVariableDeclaration = (refPath, scope) => {
    return refPath.findParent(path => path.isVariableDeclarator() && path.scope === scope);
  };

  /**
   * Find all bindings to the given VariableDeclarator (node.id) and replace the binding
   * with the Props property (node.init)
   *
   * @param {import("@babel/traverse").NodePath} ref reference to a VariableDeclarator
   */
  const replaceRefWithProps = ref => {
    // don't visit already removed nodes again
    if (!ref.node) {
      return;
    }
    const props = ref.node.init;

    if (
      // replace direct assignments like "var text = Props.text"
      (t.isMemberExpression(props) && t.isIdentifier(props.object, { name: PARAM_NAME })) ||
      // or replace ConditionalExpressions (props with default value)
      // like: var text = Props.text !== undefined ? Props.text : "default";
      (t.isConditionalExpression(props) &&
        t.isBinaryExpression(props.test) &&
        t.isMemberExpression(props.test.left) &&
        t.isIdentifier(props.test.left.object, { name: PARAM_NAME }))
    ) {
      const id = ref.node.id.name;
      ref.scope.bindings[id].referencePaths.forEach(path => path.replaceWith(props));

      // remove unused variable assignment
      ref.remove();
    }
  };

  /**
   * Check if a FunctionDeclaration is actually a Component definition of ReScript.
   * - Components only have one parameter.
   * - The name of the parameter should be "Props".
   *
   * @param {[string]} params the parameters of a function declaration
   * @returns bool
   */
  const isRescriptComponent = params => params.length == 1 && t.isIdentifier(params[0], { name: PARAM_NAME });

  /**
   * Find all variable declarations that reference a prop and replace all occurrences of the declarations with
   * the property from the props. Afterwards the declaration is removed.
   *
   * @param {import("@babel/traverse").NodePath} path path to a FunctionDeclaration
   */
  const findAndReplaceVariableReferences = path => {
    const { scope } = path;

    // check if Props is referenced inside the component (or unused)
    if (!scope.hasOwnBinding(PARAM_NAME)) {
      return;
    }

    const pathFromRefs = scope
      .getBinding(PARAM_NAME)
      .referencePaths.map(path => findRefInVariableDeclaration(path, scope))
      .filter(path => path);

    pathFromRefs.forEach(path => replaceRefWithProps(path, scope));
  };

  return {
    name: "transform-props",
    visitor: {
      /**
       * We are interested in components that use Props
       * @param {import("@babel/traverse").NodePath} path
       */
      FunctionDeclaration(path) {
        const {
          node: { params },
        } = path;

        if (!isRescriptComponent(params)) {
          return;
        }
        findAndReplaceVariableReferences(path);
      },
      // ArrowFunctionExpression(path) {
      //   replaceWithProps(path);
      // },
    },
  };
}
