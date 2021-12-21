import { User } from "discord.js";
import {
  Message,
  MessageEmbed,
  MessageReaction,
  ReactionCollector,
} from "discord.js";
import { EmojiRaw } from "../../Emoji";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { DiscordService } from "../../../services/Discord/DiscordService";
import { GowonContext } from "../../context/Context";

export class ConfirmationEmbed {
  private get discordService() {
    return ServiceRegistry.get(DiscordService);
  }

  private readonly reactionEmoji = EmojiRaw.checkmark;
  private readonly rejectionEmoji = "❌";

  public sentMessage: Message | undefined;
  private originalMessage: Message;

  private allowRejection = false;

  constructor(
    private ctx: GowonContext,
    private embed: MessageEmbed,
    originalMessage?: Message
  ) {
    this.originalMessage = originalMessage || ctx.command.message;
  }

  public withRejectionReact(): ConfirmationEmbed {
    this.allowRejection = true;

    return this;
  }

  private get filter(): ReactionCollectorFilter {
    return (reaction: MessageReaction, user: User) => {
      return (
        user.id === this.ctx.command.author.id &&
        ((reaction.emoji.id ?? reaction.emoji.name) === this.reactionEmoji ||
          (this.allowRejection &&
            (reaction.emoji.id ?? reaction.emoji.name) === this.rejectionEmoji))
      );
    };
  }

  public async awaitConfirmation(
    ctx: GowonContext,
    timeout = 30000
  ): Promise<boolean> {
    return new Promise(async (resolve) => {
      const sentEmbed = await this.discordService.send(ctx, this.embed, {
        inChannel: this.originalMessage.channel,
      });

      this.sentMessage = sentEmbed;

      await sentEmbed.react(this.reactionEmoji);

      if (this.allowRejection) await sentEmbed.react(this.rejectionEmoji);

      const collector = new ReactionCollector(sentEmbed, {
        filter: this.filter,
        time: timeout,
      });

      collector.on("collect", async (reaction: MessageReaction) => {
        const emoji = reaction.emoji;

        const emojiResolvable = emoji.id ?? emoji.name;

        if (emojiResolvable == this.reactionEmoji) {
          collector.stop("collected");
        } else {
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
          await sentEmbed.edit({
            embeds: [
              this.embed.setFooter({
                text: (
                  (this.embed.footer?.text || "") +
                  (reason === "rejected"
                    ? `\n\n❌ This confirmation has been rejected.`
                    : `\n\n🕒 This confirmation has timed out.`)
                ).trim(),
              }),
            ],
          });
          this.sentMessage!.reactions.resolve(this.reactionEmoji)!.users.remove(
            this.ctx.client.client.user?.id
          );
        }

        return resolve(false);
      });
    });
  }
}
