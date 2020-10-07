import test from "ava";
import { Perspective } from "../../lib/Perspective";
import "../../extensions/string.extensions";

test("should be second person when usernames are the same", async (t) => {
  let perspective = Perspective.perspective("flushed_emoji", "flushed_emoji");

  t.deepEqual(perspective.name, "you");
  t.deepEqual(perspective.plusToHave, "you have");
  t.deepEqual(perspective.possessive, "your");
});

test("should be third person when usernames are different", async (t) => {
  let perspective = Perspective.perspective("flushed_emoji", "olivia_hye");

  t.deepEqual(perspective.name, "`olivia_hye`");
  t.deepEqual(perspective.plusToHave, "`olivia_hye` has");
  t.deepEqual(perspective.possessive, "`olivia_hye`'s");
});

test("should not have a username be code when disabled", async (t) => {
  let perspective = Perspective.perspective("flushed_emoji", "olivia_hye", false);

  t.deepEqual(perspective.name, "olivia_hye");
  t.deepEqual(perspective.plusToHave, "olivia_hye has");
  t.deepEqual(perspective.possessive, "olivia_hye's");
});

test("should conjugate a regular verb", async (t) => {
  let perspective1 = Perspective.perspective("flushed_emoji", "olivia_hye");
  let perspective2 = Perspective.perspective("flushed_emoji", "flushed_emoji");

  t.deepEqual(perspective1.regularVerb("test"), "`olivia_hye` tests")
  t.deepEqual(perspective2.regularVerb("test"), "you test")
});

test("should be uppercase when enabled", async (t) => {
  let perspective = Perspective.perspective("flushed_emoji", "flushed_emoji");

  t.deepEqual(perspective.upper.name, "You");
  t.deepEqual(perspective.upper.plusToHave, "You have");
  t.deepEqual(perspective.upper.possessive, "Your");
});
