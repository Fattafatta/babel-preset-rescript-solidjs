module.exports = {
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },

  extends: ["prettier", "plugin:prettier/recommended"],
  plugins: ["import", "prettier", "@babel/development"],
  rules: {
    "prettier/prettier": "error",
    "import/no-extraneous-dependencies": "error",
    "@babel/development/no-deprecated-clone": "on",
    "@babel/development/no-undefined-identifier": "on",
    "@babel/development/plugin-name": "error",
  },
};
