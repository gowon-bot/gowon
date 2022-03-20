import { Message, MessageEmbed } from "discord.js";
import { GowonContext } from "../../lib/context/Context";
import { BaseMockService } from "./BaseMockService";

export class MockNowPlayingEmbedParsingService extends BaseMockService {
  hasParsableEmbed(_ctx: GowonContext, _message: Message) {
    return false;
  }

  hasParsableGowonEmbed(_ctx: GowonContext, _message: Message) {
    return false;
  }

  parseGowonEmbed(_embed: MessageEmbed) {
    return undefined;
  }

  hasParsableFmbotEmbed(_ctx: GowonContext, _message: Message) {
    return false;
  }

  parseFmbotEmbed(_embed: MessageEmbed) {
    return undefined;
  }

  hasParsableChuuEmbed(_ctx: GowonContext, _message: Message) {
    return false;
  }

  parseChuuEmbed(_embed: MessageEmbed) {
    return undefined;
  }

  hasParsableWhoKnowsEmbed(_ctx: GowonContext, _message: Message) {
    return false;
  }

  parseWhoKnowsEmbed(_embed: MessageEmbed) {
    return undefined;
  }
}
