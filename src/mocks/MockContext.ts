import { MessageEmbed } from "discord.js";
import { SimpleMap } from "../helpers/types";
import { Logger } from "../lib/Logger";
import { Command } from "../lib/command/Command";
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

interface MockContextParameters<T> extends ContextParamaters<T> {
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

  get botUser() {
    return new MockUser(mockBotId);
  }
}

export class MockLogger extends Logger {
  closeCommandHeader() {}
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
  const command = new CommandThatShouldntRun();
  const ctx = new MockContext<T>({
    payload: new Payload(new MockMessage()),
    extract: mockExtractedCommand(),
    gowonClient: {} as any,
    logger: new MockLogger(),
    command: command,
    ...overrides,
  });

  command.ctx = ctx;

  return ctx;
}

export function mockExtractedCommand(...strings: string[]): ExtractedCommand {
  return new ExtractedCommand(
    strings.map((s) => ({ matched: s, command: {} as any }))
  );
}
