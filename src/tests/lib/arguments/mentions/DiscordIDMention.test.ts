import test from "ava";
import { DiscordIDMention } from "../../../../lib/arguments/mentions/DiscordIDMention";

test("should parse a discord ID", async (t) => {
  let discordIDMention = new DiscordIDMention(true);

  let simpleID = "id:204196204668649472";
  let shortID = "id:99878737570443264";
  let simpleIDWithSpace = "id:                           627571112800288768";

  let simpleIDParsed = discordIDMention.parse(simpleID);
  let shortIDParsed = discordIDMention.parse(shortID);
  let simpleIDWithSpaceParsed = discordIDMention.parse(simpleIDWithSpace);

  t.deepEqual(simpleIDParsed[0], "204196204668649472");
  t.deepEqual(shortIDParsed[0], "99878737570443264");
  t.deepEqual(simpleIDWithSpaceParsed[0], "627571112800288768");
});

test("should not parse anything if no id is supplied", async (t) => {
  let lastFMMention = new DiscordIDMention(true);

  let noID = "id:";
  let noID2 = "some other things id:";

  let noIDParsed = lastFMMention.parse(noID);
  let noID2Parsed = lastFMMention.parse(noID2);

  t.deepEqual(noIDParsed, []);
  t.deepEqual(noID2Parsed, []);
});
