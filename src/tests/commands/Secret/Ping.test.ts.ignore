import test from "ava";
import Ping from "../../../src/commands/Secret/Ping";
import { MockGowon } from "../../../src/mocks/MockGowon";
import { responseContains } from "../../../src/mocks/testHelpers";

let mocks = MockGowon.getInstance();

test.before(mocks.setup.bind(mocks));

test("Ping should pong", async (t) => {
  let ping = mocks.command(new Ping());

  await ping.execute(mocks.message(), mocks.runAs);

  t.true(responseContains(ping, "Pong"));
});

test.after.always("guaranteed cleanup", mocks.teardown.bind(mocks));
