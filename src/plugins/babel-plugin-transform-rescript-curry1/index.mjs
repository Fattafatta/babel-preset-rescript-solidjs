/** Visitor factory for babel, removing variable declarations with Curry._1 calls.
 *
 * What we want to handle here is this FunctionDeclaration:
 *
 *   function Component(Props) {
 *     // ... other code ...
 *     var m = Curry._1(maybe, undefined);
 *     return JsxRuntime.jsx("div", undefined, m);
 *   }
 *
 * and transform it to:
 *
 *   function Component(Props) {
 *     // ... other code ...
 *     return JsxRuntime.jsx("div", undefined, Curry._1(maybe, undefined));
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
  const PARAM_LOWER = "props";

  /**
   * Check if a FunctionDeclaration is actually a Component definition of ReScript.
   * - Components only have one parameter.
   * - The name of the parameter should be "Props".
   *
   * @param {import("@babel/traverse").Binding} binding the parameters of a function declaration
   * @returns bool
   */
  const isCurry1Call = binding => {
    const node = binding.path.node;
    return (
      t.isVariableDeclarator(node) &&
      t.isCallExpression(node.init) &&
      t.isMemberExpression(node.init.callee) &&
      t.isIdentifier(node.init.callee.property, { name: "_1" }) &&
      t.isIdentifier(node.init.callee.object, { name: "Curry" }) &&
      binding.path.node.init.arguments.length == 2 &&
      t.isIdentifier(binding.path.node.init.arguments[1], { name: "undefined" })
    );
  };

  /**
   * Find all variable declarations that are the result of a Curry._1 call with no arguments (undefined).
   * Replaces all references to this variable with the function call itself. Afterwards the declaration is removed.
   *
   * @param {import("@babel/traverse").NodePath} path path to a FunctionDeclaration
   */
  const findAndReplaceCurry1Calls = path => {
    const { scope } = path;
    var bindings = Object.keys(scope.bindings).map(key => scope.getBinding(key));

    bindings.forEach(binding => {
      if (isCurry1Call(binding)) {
        binding.referencePaths.forEach(path => {
          path.replaceWith(binding.path.node.init);
        });

        // remove unused variable declaration
        binding.path.remove();
      }
    });
  };

  /**
   * Check if a FunctionDeclaration is actually a Component definition of ReScript.
   * - Components only have one parameter.
   * - The name of the parameter should be "Props" or "props".
   *
   * @param {[string]} params the parameters of a function declaration
   * @returns bool
   */
  const isRescriptComponent = params =>
    params.length == 1 &&
    (t.isIdentifier(params[0], { name: PARAM_NAME }) || t.isIdentifier(params[0], { name: PARAM_LOWER }));

  return {
    name: "transform-curry-1",
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
        findAndReplaceCurry1Calls(path);
      },
    },
  };
}
