import { MessageEmbed } from "discord.js";
import { SimpleMap } from "../helpers/types";
import { ExtractedCommand } from "../lib/command/extractor/ExtractedCommand";
import {
  ContextParamaters,
  CustomContext,
  GowonContext,
} from "../lib/context/Context";
import { Payload } from "../lib/context/Payload";
import { Logger } from "../lib/Logger";
import { BaseLastFMConverter } from "../services/LastFM/converters/BaseConverter";
import { MockMessage } from "./discord";

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
}

export class MockLogger extends Logger {
  closeCommandHeader() { }
}

export function mockContext<T extends CustomContext = CustomContext>(
  overrides: Partial<MockContextParameters<T>> = {}
): MockContext<T> {
  return new MockContext<T>({
    payload: new Payload(new MockMessage()),
    extract: mockExtractedCommand(),
    gowonClient: {} as any,
    logger: new MockLogger(),
    ...overrides,
  });
}

export function mockExtractedCommand(...strings: string[]): ExtractedCommand {
  return new ExtractedCommand(
    strings.map((s) => ({ matched: s, command: {} as any }))
  );
}
