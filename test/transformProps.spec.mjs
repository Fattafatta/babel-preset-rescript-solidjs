import { test } from "uvu";
import chai, { expect } from "chai";
//import * as assert from "uvu/assert";
import transformTo from "./chai-assertions.mjs";
import transformPlugin from "../src/plugins/babel-plugin-transform-rescript-props/index.mjs";

chai.use(transformTo({ plugins: [transformPlugin] }));

test("only transform components", () => {
  expect("function x() {var a = props.a}").to.transformTo("function x() { var a = props.a }");
  expect("function x(something) {var a = props.a}").to.transformTo("function x(something) {var a = props.a}");
  expect("function x(props, second) {var a = props.a}").to.transformTo("function x(props, second) {var a = props.a}");
});

test("don't transform unused props", () => {
  expect("function x(props) {}").to.transformTo("function x(props) {}");
});

test("replace single property", () => {
  expect("function x(props) {var a = props.a; return a}").to.transformTo("function x(props) { return props.a; }");
});

test("transform function expressions that are components", () => {
  expect("var f = function x(props) {var a = props.a; return a}").to.transformTo(
    "var f = function x(props) { return props.a; }"
  );
});

test("ignore function expressions that are not components", () => {
  expect("var f = function x(obj) {var a = ojb.a; return a}").to.transformTo(
    "var f = function x(obj) {var a = ojb.a; return a}"
  );
});

test("replace multiple properties", () => {
  expect("function x(props) {var a = props.a, b = props.b; return [a, b]}").to.transformTo(
    "function x(props) { return [props.a, props.b]; }"
  );
});

test("replace prop in binary expression", () => {
  expect("function x(props) {var a = props.a; return a + a}").to.transformTo(
    "function x(props) { return props.a + props.a; }"
  );
});

test("don't remove non-direct assignments", () => {
  expect("function x(props) {var a = props.a + 'b'; return a}").to.transformTo(
    "function x(props) { var a = props.a + 'b'; return a; }"
  );
  expect("function x(props) {var a = {b: props.a}; return a;}").to.transformTo(
    "function x(props) { var a = { b: props.a }; return a; }"
  );
});

test("replace props that have a default value", () => {
  expect("function x(props) {var a = props.a !== undefined ? props.a : 'b'; return a}").to.transformTo(
    "function x(props) {return props.a !== undefined ? props.a : 'b'}"
  );
});

test.run();
