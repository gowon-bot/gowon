import { Payload } from "../../../lib/context/Payload";
import { MockGuild, MockGuildlessMessage } from "../../../mocks/discord";
import { mockContext } from "../../../mocks/MockContext";

describe("Context", () => {
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

    expect(() => context.requiredGuild).toThrow("run in a server");
  });

  test("should assign properties to the command when set", () => {
    const context = mockContext();

    context.dangerousSetCommand({ name: "gowon one and only" });

    expect(context.command.name).toBe("gowon one and only");
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
