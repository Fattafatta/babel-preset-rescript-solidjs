import transformRescriptJSX from "@fattafatta/babel-plugin-rescript-react-to-jsx";
import transformProps from "./plugins/babel-plugin-transform-rescript-props";
import transformCurry1 from "./plugins/babel-plugin-transform-rescript-curry1";
import presetSolid from "babel-preset-solid";

export default function (context, options = {}) {
  const plugins = [transformProps, transformCurry1, [transformRescriptJSX, options]];
  const presets = [presetSolid];

  return {
    plugins,
    presets,
  };
}
