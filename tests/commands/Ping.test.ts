import test from "ava";
import { MessageEmbed } from "discord.js";
import Ping from "../../src/commands/Secret/Ping";
import { MockGowon } from "../../src/mocks/MockGowon";

let mocks = MockGowon.getInstance();

test("Ping should pong", async (t) => {
  await mocks.getSetup()();

  let ping = mocks.command(new Ping());

  await ping.execute(mocks.message(), mocks.runAs);

  let response = ping.responses[0];

  if (response instanceof MessageEmbed) {
    t.true(response.description?.includes("Pong"));
  } else {
    t.true(response.includes("Pong"));
  }

  await mocks.getSetdown()();
});
