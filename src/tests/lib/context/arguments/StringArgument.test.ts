import "../../../shims";

import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentValidationError } from "../../../../lib/validation/validators/BaseValidator";
import { mockContext } from "../../../../mocks/MockContext";
import { MockMessage } from "../../../../mocks/discord";
import { setMockServices } from "../../../../mocks/services/mockServices";

describe("StringArgument", () => {
  beforeEach(setMockServices);

  test("should parse a string from a message", () => {
    const stringArgument = new StringArgument({ index: 0 });
    const ctx = mockContext();
    const message = new MockMessage("one");

    const parsed = stringArgument.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed).toBe("one");
  });

  test("shouldn't parse an invalid string from a message", () => {
    const stringArgument = new StringArgument({ index: 8 });
    const ctx = mockContext();
    const message = new MockMessage("one");

    const parsed = stringArgument.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed).toBeFalsy();
  });

  test("should join several parsed strings from a message", () => {
    const stringArgument1 = new StringArgument({
      index: { start: 0, stop: 2 },
    });
    const stringArgument2 = new StringArgument({
      index: { start: 3, stop: 4 },
    });

    const ctx = mockContext();
    const message = new MockMessage("one two three four five");

    const parsed1 = stringArgument1.parseFromMessage(
      message,
      message.content,
      ctx
    );

    const parsed2 = stringArgument2.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed1).toBe("one two three");
    expect(parsed2).toBe("four five");
  });

  test("should parse a multiword string from a message", () => {
    const stringArgument = new StringArgument({
      index: { start: 0 },
    });

    const ctx = mockContext();
    const message = new MockMessage("one two three four five");

    const parsed = stringArgument.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed).toBe("one two three four five");
  });

  test("should parse a string with a custom split from a message", () => {
    const stringArgument = new StringArgument({
      index: { start: 0 },
      splitOn: "|",
    });

    const ctx = mockContext();
    const message = new MockMessage("one |two | three| four|five");

    const parsed = stringArgument.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed).toBe("one two three four five");
  });

  test("should match defined strings from a message", () => {
    const stringArgument1 = new StringArgument({
      match: ["one"],
    });

    const stringArgument2 = new StringArgument({
      match: ["four", "three"],
      index: 1,
    });

    const stringArgument3 = new StringArgument({
      match: ["six"],
    });

    const ctx = mockContext();
    const message = new MockMessage("one two three four five");

    const parsed1 = stringArgument1.parseFromMessage(
      message,
      message.content,
      ctx
    );

    const parsed2 = stringArgument2.parseFromMessage(
      message,
      message.content,
      ctx
    );

    const parsed3 = stringArgument3.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed1).toBe("one");
    expect(parsed2).toBe("four");
    expect(parsed3).toBeFalsy();
  });

  test("should match a regex from a message", () => {
    const stringArgument1 = new StringArgument({
      regex: /o/g,
      index: { start: 0 },
    });

    const stringArgument2 = new StringArgument({
      regex: /don't match me/g,
    });

    const ctx = mockContext();
    const message = new MockMessage("one two three four five");

    const parsed1 = stringArgument1.parseFromMessage(
      message,
      message.content,
      ctx
    );

    const parsed2 = stringArgument2.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed1).toBe("o o o");
    expect(parsed2).toBeFalsy();
  });

  test("should strictly parse choices from a message", () => {
    const stringArgument1 = new StringArgument({
      choices: ["one"],
      index: 0,
    });

    const stringArgument2 = new StringArgument({
      choices: [{ name: "2", value: "two" }],
      index: 1,
    });

    const ctx = mockContext();
    const message = new MockMessage("one two three four five");

    const parsed1 = stringArgument1.parseFromMessage(
      message,
      message.content,
      ctx
    );

    const parsed2 = stringArgument2.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed1).toBe("one");
    expect(parsed2).toBe("two");
  });

  test("should fail validation when parsing invalid arguments", () => {
    const stringArgument1 = new StringArgument({
      index: 8,
      required: true,
    });

    const stringArgument2 = new StringArgument({
      choices: ["six"],
      index: 0,
    });

    const ctx = mockContext();
    const message = new MockMessage("one two three four five");

    const parsed1 = stringArgument1.parseFromMessage(
      message,
      message.content,
      ctx
    );

    const parsed2 = stringArgument2.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(() => stringArgument1.validate(parsed1, "")).toThrow(
      ArgumentValidationError
    );
    expect(() => stringArgument2.validate(parsed2, "")).toThrow(
      ArgumentValidationError
    );
  });

  test("should default", () => {
    const stringArgument1 = new StringArgument({
      index: 8,
      default: "zero",
    });

    const stringArgument2 = new StringArgument({
      index: 0,
      default: "zero",
    });

    const stringArgument3 = new StringArgument({
      index: 8,
      default: () => "zero",
    });

    const ctx = mockContext();
    const message = new MockMessage("one two three four five");

    const parsed1 = stringArgument1.parseFromMessage(
      message,
      message.content,
      ctx
    );

    const parsed2 = stringArgument2.parseFromMessage(
      message,
      message.content,
      ctx
    );

    const parsed3 = stringArgument3.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed1).toBe("zero");
    expect(parsed2).toBe("one");
    expect(parsed3).toBe("zero");
  });

  test("should preprocess", () => {
    const stringArgument = new StringArgument({
      index: 0,
      preprocessor: (c) => c.replaceAll("o", "p"),
    });

    const ctx = mockContext();
    const message = new MockMessage("one two three four five");

    const parsed = stringArgument.parseFromMessage(
      message,
      message.content,
      ctx
    );

    expect(parsed).toBe("pne");
  });
});
