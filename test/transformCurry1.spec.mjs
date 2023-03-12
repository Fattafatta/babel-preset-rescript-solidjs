import { test } from "uvu";
import chai, { expect } from "chai";
//import * as assert from "uvu/assert";
import transformCurryTo from "./chai-assertions.mjs";
import transformPlugin from "../src/plugins/babel-plugin-transform-rescript-curry1/index.mjs";

chai.use(transformCurryTo({ plugins: [transformPlugin] }, "transformCurryTo"));

test("transform simple Curry._1", () => {
  expect("function x(props) {var m = Curry._1(a, undefined)}").to.transformCurryTo("function x(props) {}");
  expect("function x(props) {var m = Curry._1(a, undefined); return m}").to.transformCurryTo(
    "function x(props) { return Curry._1(a, undefined)}"
  );
});

test("don't transform simple Curry._1 with actual parameter", () => {
  expect("function x(props) {var m = Curry._1(a, 1)}").to.transformCurryTo(
    "function x(props) {var m = Curry._1(a, 1)}"
  );
  expect("function x(props) {var m = Curry._1(a, 1); return m}").to.transformCurryTo(
    "function x(props) {var m = Curry._1(a, 1); return m}"
  );
});

test("don't transform Curry._2", () => {
  expect("function x(props) {var m = Curry._2(a, 1, 2)}").to.transformCurryTo(
    "function x(props) {var m = Curry._2(a, 1, 2)}"
  );
  expect("function x(props) {var m = Curry._2(a, 1, 2); return m}").to.transformCurryTo(
    "function x(props) {var m = Curry._2(a, 1, 2); return m}"
  );
});

test("don't transform similar names", () => {
  expect("function x(props) {var m = curry._1(a, 1)}").to.transformCurryTo(
    "function x(props) {var m = curry._1(a, 1)}"
  );
  expect("function x(props) {var m = Curry.__1(a, 1)}").to.transformCurryTo(
    "function x(props) {var m = Curry.__1(a, 1)}"
  );
});

test("replace multiple curry", () => {
  expect(
    "function x(props) {var m = Curry._1(a, undefined); var n = Curry._1(b, undefined); return [m, n]}"
  ).to.transformCurryTo("function x(props) { return [Curry._1(a, undefined), Curry._1(b, undefined)]; }");
});

test("replace prop in binary expression", () => {
  expect("function x(props) {var a = Curry._1(b, undefined); return a + a}").to.transformCurryTo(
    "function x(props) { return Curry._1(b, undefined) + Curry._1(b, undefined); }"
  );
});

test("don't remove non-direct assignments", () => {
  expect("function x(props) {var m = Curry._1(a, undefined) + 'b'; return a}").to.transformCurryTo(
    "function x(props) {var m = Curry._1(a, undefined) + 'b'; return a}"
  );
  expect("function x(props) {var a = {b: Curry._1(a, undefined)}; return a;}").to.transformCurryTo(
    "function x(props) { var a = { b: Curry._1(a, undefined) }; return a; }"
  );
});

test.run();
