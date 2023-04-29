import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { mockContext } from "../../../../mocks/MockContext";
import { MockMessage } from "../../../../mocks/discord";
import { setMockServices } from "../../../../mocks/services/mockServices";
import "../../shims";

describe("Context", () => {
  beforeEach(setMockServices);

  test("should parse a string argument from a message", () => {
    const stringArgument = new StringArgument({ index: 0 });
    const ctx = mockContext();
    const message = new MockMessage("test");

    const parsed = stringArgument.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed).toBe("test");
  });
});
