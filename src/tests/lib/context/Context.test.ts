import "../../shims";

import { GuildRequiredError } from "../../../errors/gowon";
import { Payload } from "../../../lib/context/Payload";
import { mockContext } from "../../../mocks/MockContext";
import { MockGuild, MockGuildlessMessage } from "../../../mocks/discord";
import { setMockServices } from "../../../mocks/services/mockServices";

describe("Context", () => {
  beforeEach(setMockServices);

  test("should be created with options", () => {
    const context = mockContext();

    expect(context.payload).toBeTruthy();
  });

  test("should return the guild from the source", () => {
    const context = mockContext();

    expect(context.guild?.id).toBe(new MockGuild().id);
  });

  test("should error if accessing the required guild with no guild", () => {
    const context = mockContext({
      payload: new Payload(new MockGuildlessMessage()),
    });

    expect(() => context.requiredGuild).toThrow(GuildRequiredError);
  });

  test("should assign properties to the command when set", () => {
    const context = mockContext();

    context.dangerousSetRunnable({ idSeed: "gowon one and only" });

    expect(context.runnable.idSeed).toBe("gowon one and only");
  });

  test("should return mutable and constant parameters", () => {
    const context = mockContext({
      custom: {
        mutable: { ping: "pong" },
        constants: { pong: "ping" },
      },
    });

    expect(context.mutable.ping).toBe("pong");
    expect(context.constants.pong).toBe("ping");
  });
});
