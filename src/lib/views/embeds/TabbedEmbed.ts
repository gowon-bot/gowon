import {
  Emoji,
  Message,
  MessageEmbed,
  MessageReaction,
  ReactionCollector,
  User,
} from "discord.js";
import {
  CannotSwitchToTabError,
  NoMessageToReactToError,
} from "../../../errors/ui";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { GowonContext } from "../../context/Context";
import { EmbedComponent } from "../framework/EmbedComponent";
import { UIComponent } from "../framework/UIComponent";

export interface TabbedEmbedTab {
  name: string;
  rawEmoji: string;
  embed: EmbedComponent;
}

export interface TabbedEmbedOptions {
  tabs: TabbedEmbedTab[];
}

export class TabbedEmbed extends UIComponent {
  private sentMessage?: Message;
  private currentTab: string;

  constructor(private ctx: GowonContext, private options: TabbedEmbedOptions) {
    super();
    this.currentTab = options.tabs[0].name;
  }

  asMessageEmbed(): MessageEmbed {
    return this.getEmbed().asMessageEmbed();
  }

  public async afterSend(message: Message<boolean>): Promise<void> {
    this.sentMessage = message;

    if (this.options.tabs.length > 1) {
      await this.react();
    }
  }

  private getEmbed(): EmbedComponent {
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
      if (!this.sentMessage) {
        throw new NoMessageToReactToError();
      }

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

        this.sentMessage!.edit({ embeds: [embed.asMessageEmbed()] });
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
