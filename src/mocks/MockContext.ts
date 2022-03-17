import { MessageEmbed } from "discord.js";
import { SimpleMap } from "../helpers/types";
import { RunAs } from "../lib/command/RunAs";
import {
  ContextParamaters,
  CustomContext,
  GowonContext,
} from "../lib/context/Context";
import { Payload } from "../lib/context/Payload";
import { Logger } from "../lib/Logger";
import { MockMessage } from "./discord";

interface MockContextParameters<T> extends ContextParamaters<T> {
  mock?: Partial<MockedContext>;
}

interface MockedContext {
  parsedArguments: SimpleMap;
}

export class MockContext<
  T extends CustomContext<any, any> = CustomContext<{}, {}>
> extends GowonContext<T> {
  private responses: Array<string | MessageEmbed> = [];

  public mocked: Partial<MockedContext>;

  constructor(options: MockContextParameters<T>) {
    super(options);

    this.mocked = options.mock || {};
  }

  latestResponse<T extends string | MessageEmbed>(): T {
    return this.responses[this.responses.length - 1] as T;
  }

  addResponse(response: string | MessageEmbed) {
    this.responses.push(response);
  }
}

export class MockLogger extends Logger {
  closeCommandHeader() {}
}

export function mockContext<T = CustomContext<{}, {}>>(
  overrides: Partial<MockContextParameters<T>> = {}
): MockContext<T> {
  return new MockContext<T>({
    payload: new Payload(new MockMessage()),
    runAs: mockRunAs(),
    gowonClient: {} as any,
    logger: new MockLogger(),
    ...overrides,
  });
}

export function mockRunAs(...strings: string[]): RunAs {
  const runAs = new RunAs();

  for (const string of strings) {
    runAs.add({ string: string, command: {} as any });
  }

  return runAs;
}
