import { Message } from "discord.js";
import { emojiVerificationChannelId } from "../../../config.json";
import { promiseAllSettled } from "../../helpers";
import { GowonContext } from "../../lib/context/Context";
import { EmojiMention } from "../../lib/context/arguments/parsers/EmojiParser";
import { Sendable } from "../../lib/ui/Sendable";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { DiscordService } from "./DiscordService";
import { RespondableChannel } from "./DiscordService.types";

interface EmojiValidation {
  valid: EmojiMention[];
  invalid: EmojiMention[];
}

export class EmojiService extends BaseService {
  private get discordService() {
    return ServiceRegistry.get(DiscordService);
  }

  public async validateEmojis(
    ctx: GowonContext,
    emojis: EmojiMention[]
  ): Promise<EmojiValidation> {
    const uniquified = this.uniquifyEmojis(emojis);

    const valid: EmojiMention[] = [];
    const maybeInvalid: EmojiMention[] = [];

    for (const emoji of uniquified) {
      if (emoji.type === "unicode" || this.validateEmoji(ctx, emoji)) {
        valid.push(emoji);
      } else {
        maybeInvalid.push(emoji);
      }
    }

    const manualVerification = await this.manualVerification(ctx, maybeInvalid);

    return {
      valid: [...valid, ...manualVerification.valid],
      invalid: manualVerification.invalid,
    };
  }

  public validateEmoji(ctx: GowonContext, emoji: EmojiMention): boolean {
    return ctx.client.client.emojis.cache.has(emoji.resolvable);
  }

  public uniquifyEmojis(emojis: EmojiMention[]): EmojiMention[] {
    return emojis.filter((value, index, self) => {
      return self.map((e) => e.resolvable).indexOf(value.resolvable) === index;
    });
  }

  private async manualVerification(
    ctx: GowonContext,
    emojis: EmojiMention[]
  ): Promise<EmojiValidation> {
    this.log(
      ctx,
      `Performing manual emoji verification on ${
        emojis.length
      } emojis: ${emojis.map((e) => e.resolvable)}`
    );

    const valid: EmojiMention[] = [];
    const invalid: EmojiMention[] = [];

    const reactTestMessage = await this.getReactTestMessage(ctx);

    if (!reactTestMessage) return { invalid: emojis, valid: [] };

    const emojiResults = await promiseAllSettled(
      emojis.map((e) => reactTestMessage.react(e.resolvable))
    );

    for (const emoji of emojis) {
      const emojiReaction = emojiResults.find(
        (er) => er.value?.emoji?.id === emoji.resolvable
      );

      if (emojiReaction) valid.push(emoji);
      else invalid.push(emoji);
    }

    return {
      valid,
      invalid,
    };
  }

  private async getReactTestMessage(
    ctx: GowonContext
  ): Promise<Message | undefined> {
    const testChannel = await this.discordService.fetchChannel(
      ctx,
      emojiVerificationChannelId
    );

    if (!testChannel) return undefined;

    const messageContent = `Emoji verification for user ${ctx.author.id}`;

    return await this.discordService.send(ctx, new Sendable(messageContent), {
      inChannel: testChannel as RespondableChannel,
    });
  }
}
