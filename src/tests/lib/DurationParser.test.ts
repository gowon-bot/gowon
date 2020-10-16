import anyTest, { TestInterface } from "ava";
import { DurationParser } from "../../lib/DurationParser";

const test = anyTest as TestInterface<{ parser: DurationParser }>;

test.beforeEach((t) => {
  t.context.parser = new DurationParser();
});

test("should parse a duration in days", async (t) => {
  let numberPlural = t.context.parser.parse("3 days");
  let numberSingular = t.context.parser.parse("3 day");
  let numberAcronym = t.context.parser.parse("3 d");

  let noSpaceNumberPlural = t.context.parser.parse("3days");
  let noSpaceNumberSingular = t.context.parser.parse("3day");
  let noSpaceNumberAcronym = t.context.parser.parse("3d");

  let plural = t.context.parser.parse("days");
  let singular = t.context.parser.parse("day");
  let acronym = t.context.parser.parse("d");

  let expected: Duration = { days: 3 };

  t.deepEqual(numberPlural, expected);
  t.deepEqual(numberSingular, expected);
  t.deepEqual(numberAcronym, expected);

  t.deepEqual(noSpaceNumberPlural, expected);
  t.deepEqual(noSpaceNumberSingular, expected);
  t.deepEqual(noSpaceNumberAcronym, expected);

  expected = { days: 1 };

  t.deepEqual(plural, expected);
  t.deepEqual(singular, expected);
  t.deepEqual(acronym, expected);
});

test("should parse a duration in months", async (t) => {
  let numberPlural = t.context.parser.parse("3 months");
  let numberSingular = t.context.parser.parse("3 month");
  let numberAcronym = t.context.parser.parse("3 m");
  let numberAcronym2 = t.context.parser.parse("3 mo");

  let noSpaceNumberPlural = t.context.parser.parse("3months");
  let noSpaceNumberSingular = t.context.parser.parse("3month");
  let noSpaceNumberAcronym = t.context.parser.parse("3m");
  let noSpaceNumberAcronym2 = t.context.parser.parse("3mo");

  let plural = t.context.parser.parse("months");
  let singular = t.context.parser.parse("month");
  let acronym = t.context.parser.parse("m");
  let acronym2 = t.context.parser.parse("mo");

  let expected: Duration = { months: 3 };

  t.deepEqual(numberPlural, expected);
  t.deepEqual(numberSingular, expected);
  t.deepEqual(numberAcronym, expected);
  t.deepEqual(numberAcronym2, expected);

  t.deepEqual(noSpaceNumberPlural, expected);
  t.deepEqual(noSpaceNumberSingular, expected);
  t.deepEqual(noSpaceNumberAcronym, expected);
  t.deepEqual(noSpaceNumberAcronym2, expected);

  expected = { months: 1 };

  t.deepEqual(plural, expected);
  t.deepEqual(singular, expected);
  t.deepEqual(acronym, expected);
  t.deepEqual(acronym2, expected);
});

test("should parse a duration in weeks", async (t) => {
  let numberPlural = t.context.parser.parse("3 weeks");
  let numberSingular = t.context.parser.parse("3 week");
  let numberAcronym = t.context.parser.parse("3 w");

  let noSpaceNumberPlural = t.context.parser.parse("3weeks");
  let noSpaceNumberSingular = t.context.parser.parse("3week");
  let noSpaceNumberAcronym = t.context.parser.parse("3w");

  let plural = t.context.parser.parse("weeks");
  let singular = t.context.parser.parse("week");
  let acronym = t.context.parser.parse("w");

  let expected: Duration = { weeks: 3 };

  t.deepEqual(numberPlural, expected);
  t.deepEqual(numberSingular, expected);
  t.deepEqual(numberAcronym, expected);

  t.deepEqual(noSpaceNumberPlural, expected);
  t.deepEqual(noSpaceNumberSingular, expected);
  t.deepEqual(noSpaceNumberAcronym, expected);

  expected = { weeks: 1 };

  t.deepEqual(plural, expected);
  t.deepEqual(singular, expected);
  t.deepEqual(acronym, expected);
});

test("should parse a duration in days", async (t) => {
  let numberPlural = t.context.parser.parse("3 days");
  let numberSingular = t.context.parser.parse("3 day");
  let numberAcronym = t.context.parser.parse("3 d");

  let noSpaceNumberPlural = t.context.parser.parse("3days");
  let noSpaceNumberSingular = t.context.parser.parse("3day");
  let noSpaceNumberAcronym = t.context.parser.parse("3d");

  let plural = t.context.parser.parse("days");
  let singular = t.context.parser.parse("day");
  let acronym = t.context.parser.parse("d");

  let expected: Duration = { days: 3 };

  t.deepEqual(numberPlural, expected);
  t.deepEqual(numberSingular, expected);
  t.deepEqual(numberAcronym, expected);

  t.deepEqual(noSpaceNumberPlural, expected);
  t.deepEqual(noSpaceNumberSingular, expected);
  t.deepEqual(noSpaceNumberAcronym, expected);

  expected = { days: 1 };

  t.deepEqual(plural, expected);
  t.deepEqual(singular, expected);
  t.deepEqual(acronym, expected);
});

test("should parse a duration in hours", async (t) => {
  let numberPlural = t.context.parser.parse("3 hours");
  let numberSingular = t.context.parser.parse("3 hour");
  let numberAcronym = t.context.parser.parse("3 h");

  let noSpaceNumberPlural = t.context.parser.parse("3hours");
  let noSpaceNumberSingular = t.context.parser.parse("3hour");
  let noSpaceNumberAcronym = t.context.parser.parse("3h");

  let plural = t.context.parser.parse("hours");
  let singular = t.context.parser.parse("hour");
  let acronym = t.context.parser.parse("h");

  let expected: Duration = { hours: 3 };

  t.deepEqual(numberPlural, expected);
  t.deepEqual(numberSingular, expected);
  t.deepEqual(numberAcronym, expected);

  t.deepEqual(noSpaceNumberPlural, expected);
  t.deepEqual(noSpaceNumberSingular, expected);
  t.deepEqual(noSpaceNumberAcronym, expected);

  expected = { hours: 1 };

  t.deepEqual(plural, expected);
  t.deepEqual(singular, expected);
  t.deepEqual(acronym, expected);
});

test("should parse a duration in minutes", async (t) => {
  let numberPlural = t.context.parser.parse("3 minutes");
  let numberSingular = t.context.parser.parse("3 minute");
  let numberAcronym = t.context.parser.parse("3 mi");

  let noSpaceNumberPlural = t.context.parser.parse("3minutes");
  let noSpaceNumberSingular = t.context.parser.parse("3minute");
  let noSpaceNumberAcronym = t.context.parser.parse("3mi");

  let plural = t.context.parser.parse("minutes");
  let singular = t.context.parser.parse("minute");
  let acronym = t.context.parser.parse("mi");

  let expected: Duration = { minutes: 3 };

  t.deepEqual(numberPlural, expected);
  t.deepEqual(numberSingular, expected);
  t.deepEqual(numberAcronym, expected);

  t.deepEqual(noSpaceNumberPlural, expected);
  t.deepEqual(noSpaceNumberSingular, expected);
  t.deepEqual(noSpaceNumberAcronym, expected);

  expected = { minutes: 1 };

  t.deepEqual(plural, expected);
  t.deepEqual(singular, expected);
  t.deepEqual(acronym, expected);
});

test("should parse a duration in seconds", async (t) => {
  let numberPlural = t.context.parser.parse("3 seconds");
  let numberSingular = t.context.parser.parse("3 second");
  let numberAcronym = t.context.parser.parse("3 s");

  let noSpaceNumberPlural = t.context.parser.parse("3seconds");
  let noSpaceNumberSingular = t.context.parser.parse("3second");
  let noSpaceNumberAcronym = t.context.parser.parse("3s");

  let plural = t.context.parser.parse("seconds");
  let singular = t.context.parser.parse("second");
  let acronym = t.context.parser.parse("s");

  let expected: Duration = { seconds: 3 };

  t.deepEqual(numberPlural, expected);
  t.deepEqual(numberSingular, expected);
  t.deepEqual(numberAcronym, expected);

  t.deepEqual(noSpaceNumberPlural, expected);
  t.deepEqual(noSpaceNumberSingular, expected);
  t.deepEqual(noSpaceNumberAcronym, expected);

  expected = { seconds: 1 };

  t.deepEqual(plural, expected);
  t.deepEqual(singular, expected);
  t.deepEqual(acronym, expected);
});

test("should not parse a duration if there isn't one present", async (t) => {
  let noDuration = t.context.parser.parse(
    "there is no duration here nope none at all"
  );
  let noDuration2 = t.context.parser.parse("dddddd");
  let noDuration3 = t.context.parser.parse("s1");

  t.deepEqual(noDuration, {});
  t.deepEqual(noDuration2, {});
  t.deepEqual(noDuration3, {});
});
