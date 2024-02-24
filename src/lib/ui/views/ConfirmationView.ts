import { Message, MessageReaction, ReactionCollector, User } from "discord.js";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { DiscordService } from "../../../services/Discord/DiscordService";
import { RespondableChannel } from "../../../services/Discord/DiscordService.types";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { GowonContext } from "../../context/Context";
import { Payload } from "../../context/Payload";
import { EmojiRaw } from "../../emoji/Emoji";
import { errorColour } from "../embeds/ErrorEmbed";
import { EmbedView } from "./EmbedView";

export class ConfirmationView {
  private get discordService() {
    return ServiceRegistry.get(DiscordService);
  }

  private readonly confirmationEmoji = EmojiRaw.checkmark;
  private readonly rejectionEmoji = EmojiRaw.x;

  public sentMessage: Message | undefined;
  private originalMessage: Payload;

  private isRejectionAllowed = false;

  constructor(
    private ctx: GowonContext,
    private embed: EmbedView,
    originalMessage?: Payload
  ) {
    this.originalMessage = originalMessage || ctx.command.payload;
  }

  public allowRejection(): ConfirmationView {
    this.isRejectionAllowed = true;

    return this;
  }

  private get filter(): ReactionCollectorFilter {
    return (_: MessageReaction, user: User) => {
      return user.id === this.ctx.command.author.id;
    };
  }

  public async awaitConfirmation(
    ctx: GowonContext,
    timeout = 30000
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const sentEmbed = await this.discordService.send(
        ctx,
        this.embed.asSendable(),
        {
          inChannel: this.originalMessage.channel as RespondableChannel,
          reply: true,
        }
      );

      this.sentMessage = sentEmbed;

      await sentEmbed.react(this.confirmationEmoji);

      if (this.isRejectionAllowed) await sentEmbed.react(this.rejectionEmoji);

      const collector = new ReactionCollector(sentEmbed, {
        filter: this.filter,
        time: timeout,
      });

      collector.on("collect", async (reaction: MessageReaction) => {
        const emoji = reaction.emoji;
        const emojiResolvable = emoji.id ?? emoji.name;

        if (emojiResolvable === this.confirmationEmoji) {
          collector.stop("collected");
        } else if (emojiResolvable === this.rejectionEmoji) {
          collector.stop("rejected");
        }
      });

      collector.on("error", () => {
        collector.stop();

        return resolve(false);
      });

      collector.on("end", async (_c: any, reason: string) => {
        if (reason === "collected") {
          return resolve(true);
        } else if (reason === "time" || reason === "rejected") {
          const footer =
            reason === "rejected"
              ? `\n\n❌ This confirmation has been rejected.`
              : `\n\n🕒 This confirmation has timed out.`;

          await this.embed
            .setColour(errorColour)
            .addFooter(footer)
            .editMessage(ctx);

          await Promise.all([
            this.removeReaction(this.confirmationEmoji),
            this.isRejectionAllowed
              ? this.removeReaction(this.rejectionEmoji)
              : undefined,
          ]);
        }

        return resolve(false);
      });
    });
  }

  private async removeReaction(reaction: string) {
    this.sentMessage!.reactions.resolve(reaction)!.users.remove(
      this.ctx.client.client.user?.id
    );
  }
}
