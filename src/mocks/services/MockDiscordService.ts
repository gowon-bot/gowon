import { Message, MessageEmbed } from "discord.js";
import { GowonContext } from "../../lib/context/Context";
import { SendOptions } from "../../services/Discord/DiscordService";
import { MockMessage } from "../discord";
import { MockContext } from "../MockContext";
import { BaseMockService } from "./BaseMockService";

export class MockDiscordService extends BaseMockService {
  public async startTyping(_ctx: GowonContext) {}

  public async send(
    ctx: MockContext,
    content: string | MessageEmbed,
    _options?: Partial<SendOptions>
  ): Promise<Message> {
    ctx.addResponse(content);

    // TBD
    return new MockMessage();
  }

  async edit(
    _ctx: GowonContext,
    _message: Message,
    _content: string | MessageEmbed
  ) {
    return new MockMessage();
  }
}
