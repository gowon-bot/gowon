import { Embed, Message } from "discord.js";
import { GowonContext } from "../../lib/context/Context";
import { BaseMockService } from "./BaseMockService";

export class MockNowPlayingEmbedParsingService extends BaseMockService {
  hasParsableEmbed(_ctx: GowonContext, _message: Message) {
    return false;
  }

  hasParsableGowonEmbed(_ctx: GowonContext, _message: Message) {
    return false;
  }

  parseGowonEmbed(_embed: Embed) {
    return undefined;
  }

  hasParsableFmbotEmbed(_ctx: GowonContext, _message: Message) {
    return false;
  }

  parseFmbotEmbed(_embed: Embed) {
    return undefined;
  }

  hasParsableChuuEmbed(_ctx: GowonContext, _message: Message) {
    return false;
  }

  parseChuuEmbed(_embed: Embed) {
    return undefined;
  }

  hasParsableWhoKnowsEmbed(_ctx: GowonContext, _message: Message) {
    return false;
  }

  parseWhoKnowsEmbed(_embed: Embed) {
    return undefined;
  }
}
