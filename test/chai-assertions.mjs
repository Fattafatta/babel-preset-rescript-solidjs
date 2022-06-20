import { transformSync } from "@babel/core";
import { format } from "prettier";

const formatCode = code => {
  return format(code.replace(/[ \n\r]+/gi, " "), { parser: "babel" });
};

export default function (babelOptions) {
  function runTransform(source) {
    try {
      return transformSync(source, { babelrc: false, ...babelOptions });
    } catch (e) {
      return e.message;
    }
  }

  return function transformTo(chai, utils) {
    chai.Assertion.addMethod("transformTo", function (expected) {
      const source = utils.flag(this, "object");
      const { code } = runTransform(source);

      new chai.Assertion(formatCode(code)).to.equal(formatCode(expected));
    });
  };
}
