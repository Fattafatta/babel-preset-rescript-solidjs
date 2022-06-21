import { test } from "uvu";
import chai, { expect } from "chai";
//import * as assert from "uvu/assert";
import transformTo from "./chai-assertions.mjs";
import transformPlugin from "../src/plugins/babel-plugin-transform-rescript-props/index.mjs";

chai.use(transformTo({ plugins: [transformPlugin] }));

test("only transform components", () => {
  expect("function x() {var a = Props.a}").to.transformTo("function x() { var a = Props.a }");
  expect("function x(props) {var a = Props.a}").to.transformTo("function x(props) {var a = Props.a}");
  expect("function x(Props, second) {var a = Props.a}").to.transformTo("function x(Props, second) {var a = Props.a}");
});

test("don't transform unused props", () => {
  expect("function x(Props) {}").to.transformTo("function x(Props) {}");
});

test("replace single property", () => {
  expect("function x(Props) {var a = Props.a; return a}").to.transformTo("function x(Props) { return Props.a; }");
});
test("replace multiple properties", () => {
  expect("function x(Props) {var a = Props.a, b = Props.b; return [a, b]}").to.transformTo(
    "function x(Props) { return [Props.a, Props.b]; }"
  );
});

test("replace prop in binary expression", () => {
  expect("function x(Props) {var a = Props.a; return a + a}").to.transformTo(
    "function x(Props) { return Props.a + Props.a; }"
  );
});

test("don't remove non-direct assignments", () => {
  expect("function x(Props) {var a = Props.a + 'b'; return a}").to.transformTo(
    "function x(Props) { var a = Props.a + 'b'; return a; }"
  );
  expect("function x(Props) {var a = {b: Props.a}; return a;}").to.transformTo(
    "function x(Props) { var a = { b: Props.a }; return a; }"
  );
});

test("replace props that have a default value", () => {
  expect("function x(Props) {var a = Props.a !== undefined ? Props.a : 'b'; return a}").to.transformTo(
    "function x(Props) {return Props.a !== undefined ? Props.a : 'b'}"
  );
});

test.run();
