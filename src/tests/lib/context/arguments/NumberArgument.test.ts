import "../../../shims";

import { Message } from "discord.js";
import { NumberArgument } from "../../../../lib/context/arguments/argumentTypes/NumberArgument";
import { mockContext } from "../../../../mocks/MockContext";
import { MockMessage } from "../../../../mocks/discord";
import { setMockServices } from "../../../../mocks/services/mockServices";

describe("NumberArgument", () => {
  beforeEach(setMockServices);

  test("should parse a number from a message", () => {
    const argument = new NumberArgument({ index: 0 });
    const ctx = mockContext();

    const parse = (m: Message) => argument.parseFromMessage(m, m.content, ctx);

    const message1 = new MockMessage("1");
    const message2 = new MockMessage("1,000,000");
    const message3 = new MockMessage("10k");
    const message4 = new MockMessage("-1234");
    const message5 = new MockMessage("00");
    const message6 = new MockMessage("294819234");
    const message7 = new MockMessage("3.14");

    expect(parse(message1)).toBe(1);
    expect(parse(message2)).toBe(1000000);
    expect(parse(message3)).toBe(10000);
    expect(parse(message4)).toBe(-1234);
    expect(parse(message5)).toBe(0);
    expect(parse(message6)).toBe(294819234);

    // No ability to parse floats yet
    expect(parse(message7)).toBe(3);
  });

  test("should not parse an invalid number from a message", () => {
    const argument = new NumberArgument({ index: 0 });
    const ctx = mockContext();

    const parse = (m: Message) => argument.parseFromMessage(m, m.content, ctx);

    const message1 = new MockMessage("---2");
    const message2 = new MockMessage("sabfbajkshfkas");
    const message3 = new MockMessage("NaN");

    expect(parse(message1)).toBeFalsy();
    expect(parse(message2)).toBeFalsy();
    expect(parse(message3)).toBeFalsy();
  });
});
