# babel-preset-rescript-solidjs

Applies all necessary transformations to compile [ReScript](https://rescript-lang.org/) code to [solidJs](https://github.com/solidjs/solid).

The original code compiled by `ReScript` is not compatible with `solid`. First, the ReScript compiler breaks reactivity by reassigning component properties to variables. And second, `solid` compiler expects JSX, but ReScript compiles all JSX directly to JavaScript.

This preset replaces the variable assignments and transforms the `ReScript` JavaScript code back to JSX. Afterwards it runs the [preset](https://github.com/solidjs/solid/tree/main/packages/babel-preset-solid) provided by `solid` to compile the code.

## Installation

```sh
$ npm install @fattafatta/babel-preset-rescript-solidjs --save-dev

# or

yarn add @fattafatta/babel-preset-rescript-solidjs --dev
```

## Usage

### Via config file

Add this to your `.babelrc`:

```json
{
  "presets": ["@fattafatta/babel-preset-rescript-solidjs"]
}
```

### With `vite`

Install `vite-plugin-babel` and `@jihchi/vite-plugin-rescript`:

```shell
npm install vite-plugin-babel @jihchi/vite-plugin-rescript --save-dev

# or
yarn add vite-plugin-babel @jihchi/vite-plugin-rescript --dev
```

Configure `vite.config.js`

```js
import { defineConfig } from "vite";
import createReScriptPlugin from "@jihchi/vite-plugin-rescript";
import babel from "vite-plugin-babel";

export default defineConfig({
  plugins: [
    createReScriptPlugin(),
    babel({
      babelConfig: {
        presets: ["@fattafatta/babel-preset-rescript-solidjs"],
      },
    }),
  ],
});
```

The babel plugin works with either the `.babelrc` file or by passing the config directly.

### Via CLI

Make sure to use the correct file extension when transforming files. ReScript files end on `.bs.js`. But JSX files should use `.jsx`.

```sh
babel --no-babelrc --presets @fattafatta/babel-preset-rescript-solidjs script.bs.js > script.js
```
