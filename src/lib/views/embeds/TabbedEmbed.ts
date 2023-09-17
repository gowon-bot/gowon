import {
  Emoji,
  Message,
  MessageEmbed,
  MessageReaction,
  ReactionCollector,
  User,
} from "discord.js";
import { CannotSwitchToTabError } from "../../../errors/gowon";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { DiscordService } from "../../../services/Discord/DiscordService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { GowonContext } from "../../context/Context";

export interface TabbedEmbedTab {
  name: string;
  rawEmoji: string;
  embed: MessageEmbed;
}

export interface TabbedEmbedOptions {
  tabs: TabbedEmbedTab[];
}

export class TabbedEmbed {
  private get discordService() {
    return ServiceRegistry.get(DiscordService);
  }

  private sentMessage!: Message;
  private currentTab: string;

  constructor(private ctx: GowonContext, private options: TabbedEmbedOptions) {
    this.currentTab = options.tabs[0].name;
  }

  public async send() {
    const embed = this.getEmbed();

    this.sentMessage = await this.discordService.send(this.ctx, embed);

    if (this.options.tabs.length > 1) {
      await this.react();
    }
  }

  private getEmbed(): MessageEmbed {
    const embed = this.options.tabs.find(
      (t) => t.name === this.currentTab
    )?.embed;

    if (!embed) throw new CannotSwitchToTabError();

    return embed;
  }

  private get filter(): ReactionCollectorFilter {
    return (_, user) => {
      return user.id === this.ctx.author.id;
    };
  }

  private async react() {
    return new Promise(async (resolve, reject) => {
      const collector = new ReactionCollector(this.sentMessage, {
        filter: this.filter,
        time: 3 * 60 * 1000,
      });

      collector.on("collect", async (reaction: MessageReaction, user: User) => {
        const emoji = reaction.emoji;
        const emojiResolvable = emoji.id ?? emoji.name;

        const newTab = this.options.tabs.find(
          (t) => t.rawEmoji === emojiResolvable
        );

        this.removeReaction(emoji, user.id);

        if (!newTab || newTab.name === this.currentTab) return;

        this.currentTab = newTab.name;

        const embed = this.getEmbed();

        this.sentMessage.edit({ embeds: [embed] });
      });

      collector.on("error", (e: Error) => {
        reject(e);
      });

      collector.on("end", () => {
        resolve(undefined);
      });

      for (const tab of this.options.tabs) {
        await this.sentMessage.react(tab.rawEmoji);
      }
    });
  }

  private async removeReaction(emoji: Emoji, userId: string) {
    if (this.ctx.botMember?.permissions?.has("MANAGE_MESSAGES")) {
      await this.sentMessage!.reactions.resolve(
        (emoji.id ?? emoji.name)!
      )!.users.remove(userId);
    }
  }
}
