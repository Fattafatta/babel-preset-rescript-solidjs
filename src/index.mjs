import transformRescriptJSX from "@fattafatta/babel-plugin-rescript-react-to-jsx";
import transformProps from "./plugins/babel-plugin-transform-rescript-props";
import presetSolid from "babel-preset-solid";

export default function (context, options = {}) {
  const plugins = [transformProps, transformRescriptJSX];
  const presets = [presetSolid];

  return {
    plugins,
    presets,
  };
}
