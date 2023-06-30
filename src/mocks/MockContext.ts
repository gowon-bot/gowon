import { Embed } from "discord.js";
import { SimpleMap } from "../helpers/types";
import { Logger } from "../lib/Logger";
import { Command } from "../lib/command/Command";
import { Runnable } from "../lib/command/Runnable";
import { ExtractedCommand } from "../lib/command/extractor/ExtractedCommand";
import {
  ContextParamaters,
  CustomContext,
  GowonContext,
} from "../lib/context/Context";
import { Payload } from "../lib/context/Payload";
import { BaseLastFMConverter } from "../services/LastFM/converters/BaseConverter";
import { CommandThatShouldntRun } from "./command/commands";
import { MockMessage, MockUser } from "./discord";

export const mockBotId = "541298511430287395";

interface MockContextParameters<T> extends ContextParamaters<T, Runnable> {
  mock?: Partial<MockedContext>;
}

interface MockedContext {
  arguments: SimpleMap;
  // Maps from method to converter
  lastFM: SimpleMap<BaseLastFMConverter>;
}

export class MockContext<
  T extends CustomContext = CustomContext
> extends GowonContext<T> {
  private responses: Array<string | Embed> = [];

  public mocked: Partial<MockedContext>;

  constructor(options: MockContextParameters<T>) {
    super(options);

    this.mocked = options.mock || {};
  }

  latestResponse<T extends string | Embed>(): T {
    return this.responses[this.responses.length - 1] as T;
  }

  addResponse(response: string | Embed) {
    this.responses.push(response);
  }

  get botUser() {
    return new MockUser(mockBotId);
  }
}

export class MockLogger extends Logger {
  openRunnableHeader(_?: any) {}
  closeRunnableHeader(_?: any) {}
}

export function mockContextForCommand<
  C extends Command,
  T extends CustomContext = CustomContext
>(
  command: { new (): C },
  overrides: Partial<MockContextParameters<T>> = {}
): { command: C; ctx: MockContext<T> } {
  return {
    command: new command(),
    ctx: mockContext({
      extract: mockExtractedCommand(command.name),
      ...overrides,
    }),
  };
}

export function mockContext<T extends CustomContext = CustomContext>(
  overrides: Partial<MockContextParameters<T>> = {}
) {
  const runnable = new CommandThatShouldntRun();
  const ctx = new MockContext<T>({
    payload: new Payload(new MockMessage()),
    extract: mockExtractedCommand(),
    gowonClient: {} as any,
    logger: new MockLogger(),
    runnable: runnable,
    ...overrides,
  });

  runnable.ctx = ctx as any as GowonContext<any, Command>;

  return ctx;
}

export function mockExtractedCommand(...strings: string[]): ExtractedCommand {
  return new ExtractedCommand(
    strings.map((s) => ({ matched: s, command: {} as any }))
  );
}
