import { Embed, Message } from "discord.js";
import { GowonContext } from "../../lib/context/Context";
import { SendOptions } from "../../services/Discord/DiscordService.types";
import { MockContext } from "../MockContext";
import { MockMessage } from "../discord";
import { BaseMockService } from "./BaseMockService";

export class MockDiscordService extends BaseMockService {
  public async startTyping(_ctx: GowonContext) {}

  public async send(
    ctx: MockContext,
    content: string | Embed,
    _options?: Partial<SendOptions>
  ): Promise<Message> {
    ctx.addResponse(content);

    // TBD
    return new MockMessage();
  }

  async edit(_ctx: GowonContext, _message: Message, _content: string | Embed) {
    return new MockMessage();
  }
}

export function erroringMockDiscordService(allowEdit?: boolean) {
  return class ErroringMockDiscordService extends MockDiscordService {
    mocks = "DiscordService";

    public async send(
      _ctx: MockContext,
      _content: string | Embed,
      _options?: Partial<SendOptions>
    ): Promise<Message> {
      throw "I shouldn't send!";
    }

    async edit(
      _ctx: GowonContext,
      _message: Message,
      _content: string | Embed
    ) {
      if (allowEdit) {
        return new MockMessage();
      } else throw "I shouldn't edit!";
    }
  };
}
