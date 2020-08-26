import test from "ava";
import ArtistPlays from "../../../src/commands/Lastfm/Plays/ArtistPlays";
import { MockGowon } from "../../../src/mocks/MockGowon";
import { responseContains } from "../../../src/mocks/testHelpers";

let mocks = MockGowon.getInstance();

test.before(mocks.setup.bind(mocks));

test("Artistplays should show your plays of an artist", async (t) => {
  let artistPlays = mocks.command(new ArtistPlays());

  await artistPlays.execute(mocks.message("artist"), mocks.runAs);

  console.log(artistPlays.responses);

  t.true(
    responseContains(artistPlays, "You have **1 **scrobble of **artist**")
  );
});

test("Artistplays should show your plays of a nowplaying artist", async (t) => {
  let artistPlays = mocks.command(new ArtistPlays());

  await artistPlays.execute(mocks.message(), mocks.runAs);

  console.log(artistPlays.responses);

  t.true(
    responseContains(
      artistPlays,
      "You have **1 **scrobble of **nowplayingartist**"
    )
  );
});

test.after.always("guaranteed cleanup", mocks.teardown.bind(mocks));
