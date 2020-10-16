import test from "ava";
import { LastFMMention } from "../../../../lib/arguments/mentions/LastFMMention";

test("should parse a LastFM username", async (t) => {
  let lastFMMention = new LastFMMention(true);

  let simpleUsername = "lfm:flushed_emoji";
  let simpleUsernameWithSpace = "lfm:                           saltmyeon";
  let weirdUsername = "lfm:!";
  let weirdUsername2 = "lastfm:last.hq";
  let weirdUsername3 = "lastfm:hyphen-username";
  let usernamePlusGarbage = "lfm:middaymarauder레드벨벳";

  let simpleUsernameParsed = lastFMMention.parse(simpleUsername);
  let simpleUsernameWithSpaceParsed = lastFMMention.parse(
    simpleUsernameWithSpace
  );
  let weirdUsernameParsed = lastFMMention.parse(weirdUsername);
  let weirdUsername2Parsed = lastFMMention.parse(weirdUsername2);
  let weirdUsername3Parsed = lastFMMention.parse(weirdUsername3);
  let usernamePlusGarbageParsed = lastFMMention.parse(usernamePlusGarbage);

  t.deepEqual(simpleUsernameParsed[0], "flushed_emoji");
  t.deepEqual(simpleUsernameWithSpaceParsed[0], "saltmyeon");
  t.deepEqual(weirdUsernameParsed[0], "!");
  t.deepEqual(weirdUsername2Parsed[0], "last.hq");
  t.deepEqual(weirdUsername3Parsed[0], "hyphen-username");
  t.deepEqual(usernamePlusGarbageParsed[0], "middaymarauder");
});

test("should not parse anything if no username is supplied", async (t) => {
  let lastFMMention = new LastFMMention(true);

  let noUsername = "lfm:";
  let noUsername2 = "some other things lfm:";

  let noUsernameParsed = lastFMMention.parse(noUsername);
  let noUsername2Parsed = lastFMMention.parse(noUsername2);

  t.deepEqual(noUsernameParsed, []);
  t.deepEqual(noUsername2Parsed, []);
});
