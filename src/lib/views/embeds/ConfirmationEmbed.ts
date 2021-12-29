import { User } from "discord.js";
import {
  Message,
  MessageEmbed,
  MessageReaction,
  ReactionCollector,
} from "discord.js";
import { EmojiRaw } from "../../Emoji";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { BaseServiceContext } from "../../../services/BaseService";

export class ConfirmationEmbed {
  private readonly reactionEmoji = EmojiRaw.checkmark;
  private readonly rejectionEmoji = "❌";

  public sentMessage: Message | undefined;
  private originalMessage: Message;

  private allowRejection = false;

  constructor(
    private ctx: BaseServiceContext,
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

  public async awaitConfirmation(timeout = 30000): Promise<boolean> {
    return new Promise(async (resolve) => {
      const sentEmbed = await this.originalMessage.channel.send({
        embeds: [this.embed],
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
              this.embed.setFooter(
                (
                  (this.embed.footer?.text || "") +
                  (reason === "rejected"
                    ? `\n\n❌ This confirmation has been rejected.`
                    : `\n\n🕒 This confirmation has timed out.`)
                ).trim()
              ),
            ],
          });
          await Promise.all([
            this.removeReaction(this.reactionEmoji),
            this.allowRejection
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
