import test from "ava";
import * as date from "../../helpers/date";

test("generatePeriod should parse a week", (t) => {
  let acronym = date.generatePeriod("w");
  let full = date.generatePeriod("week");

  t.deepEqual(acronym, "7day");
  t.deepEqual(full, "7day");
});

test("generatePeriod should parse a month", (t) => {
  let acronym = date.generatePeriod("m");
  let acronym2 = date.generatePeriod("mo");
  let full = date.generatePeriod("month");

  t.deepEqual(acronym, "1month");
  t.deepEqual(acronym2, "1month");
  t.deepEqual(full, "1month");
});

test("generatePeriod should parse a quarter", (t) => {
  let acronym = date.generatePeriod("q");
  let full = date.generatePeriod("quarter");

  t.deepEqual(acronym, "3month");
  t.deepEqual(full, "3month");
});

test("generatePeriod should parse a half year", (t) => {
  let acronym = date.generatePeriod("h");
  let half = date.generatePeriod("half");
  let full = date.generatePeriod("half year");

  t.deepEqual(acronym, "6month");
  t.deepEqual(half, "6month");
  t.deepEqual(full, "6month");
});

test("generatePeriod should parse a year", (t) => {
  let acronym = date.generatePeriod("y");
  let full = date.generatePeriod("year");

  t.deepEqual(acronym, "12month");
  t.deepEqual(full, "12month");
});

test("generatePeriod should parse overall", (t) => {
  let alltimeAcronym = date.generatePeriod("a");
  let alltimeFull = date.generatePeriod("alltime");

  let overallAcronym = date.generatePeriod("o");
  let overallFull = date.generatePeriod("overall");

  t.deepEqual(alltimeAcronym, "overall");
  t.deepEqual(alltimeFull, "overall");
  t.deepEqual(overallAcronym, "overall");
  t.deepEqual(overallFull, "overall");
});

test("generatePeriod should use a fallback", (t) => {
  let usingDefault = date.generatePeriod("osajfhkljashf jolsahgfj");
  let usingFallback = date.generatePeriod("osajfhkljashf jolsahgfj", "7day");

  t.deepEqual(usingDefault, "overall");
  t.deepEqual(usingFallback, "7day");
});
