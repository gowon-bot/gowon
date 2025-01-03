import {
  EmbedFieldData,
  Emoji,
  MessageReaction,
  ReactionCollector,
  User,
} from "discord.js";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { GowonContext } from "../../context/Context";
import { EmojiRaw } from "../../emoji/Emoji";
import { displayNumber } from "../displays";
import { EmbedView } from "./EmbedView";
import { View } from "./View";

export interface ScrollingViewOptions {
  initialItems: string | EmbedFieldData[];
  totalPages: number;
  totalItems: number;
  startingPage: number;
  embedDescription: string;
  itemName: string;
  itemNamePlural: string;

  customFooter: ((page: number, totalPages: number) => string) | string;
}

type OnPageChangeCallback = (
  page: number,
  totalPages: number
) => string | EmbedFieldData[] | Promise<string | EmbedFieldData[]>;

export function isEmbedFields(
  value: string | EmbedFieldData[] | any
): value is EmbedFieldData[] {
  return !!(
    (value[0] as EmbedFieldData)?.name && (value[0] as EmbedFieldData)?.value
  );
}

export class ScrollingView extends View {
  private currentPage = 1;
  private currentItems: string | EmbedFieldData[];
  private options: ScrollingViewOptions;
  private onPageChangeCallback: OnPageChangeCallback = () => "";

  private readonly leftArrow = EmojiRaw.arrowLeft;
  private readonly rightArrow = EmojiRaw.arrowRight;
  private readonly lastArrow = EmojiRaw.arrowLast;
  private readonly firstArrow = EmojiRaw.arrowFirst;

  constructor(
    private ctx: GowonContext,
    private embed: EmbedView,
    options: Partial<ScrollingViewOptions>
  ) {
    super();

    this.options = Object.assign(
      {
        initialItems: "",
        embedDescription: "",
        itemName: "entity",
        itemNamePlural: options.itemName ? options.itemName + "s" : "entities",
        totalPages: -1,
        totalItems: -1,
        startingPage: 1,
        customFooter: "",
      },
      options
    );

    this.currentItems = this.options.initialItems;
    this.currentPage = this.options.startingPage;

    this.hook("afterSend", this.react.bind(this));
  }

  asDiscordSendable(): EmbedView {
    this.generateEmbed();

    return this.embed.asDiscordSendable();
  }

  public onPageChange(callback: OnPageChangeCallback) {
    this.onPageChangeCallback = callback;
  }

  private get filter(): ReactionCollectorFilter {
    return (_, user) => {
      return user.id === this.ctx.author.id;
    };
  }

  private generateEmbed() {
    this.embed.setFooter(this.generateFooter());

    if (isEmbedFields(this.currentItems)) {
      this.embed.setDescription(this.options.embedDescription);
      this.embed.setFields([]);
      this.currentItems.forEach((item) => this.embed.addFields(item));
    } else {
      this.embed.setDescription(
        `${this.options.embedDescription}\n${this.currentItems}`
      );
    }
  }

  private generateFooter(): string {
    if (this.options.customFooter instanceof Function) {
      return this.options.customFooter(
        this.currentPage,
        this.options.totalPages
      );
    }

    let footer = "";

    if (this.options.totalPages >= 0) {
      footer += `Page ${this.currentPage} of ${this.options.totalPages || 1}`;
    }

    if (this.options.totalItems >= 0) {
      if (this.options.totalPages >= 0) footer += " • ";

      footer += `${displayNumber(this.options.totalItems)} ${
        this.options.totalItems === 1
          ? this.options.itemName
          : this.options.itemNamePlural
      }`;
    }

    return (
      footer +
      (this.options.customFooter ? "\n" + this.options.customFooter : "")
    );
  }

  private async react(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      const sentMessage = this.getSentMessage();

      if (this.options.totalPages < 2) return;

      const collector = new ReactionCollector(sentMessage, {
        filter: this.filter,
        time: 3 * 60 * 1000,
      });

      collector.on("collect", async (reaction: MessageReaction, user: User) => {
        const emoji = reaction.emoji;

        let page = this.currentPage;
        const emojiResolvable = emoji.id ?? emoji.name;

        if (emojiResolvable === this.firstArrow && page !== 1) {
          page = 1;
        }
        if (emojiResolvable === this.leftArrow && page !== 1) {
          page--;
        }
        if (
          emojiResolvable === this.rightArrow &&
          page !== this.options.totalPages
        ) {
          page++;
        }
        if (
          emojiResolvable === this.lastArrow &&
          this.currentPage !== this.options.totalPages
        ) {
          page = this.options.totalPages;
        }

        if (page === this.currentPage) return;

        this.currentPage = page;

        Promise.resolve(
          this.onPageChangeCallback(this.currentPage, this.options.totalPages)
        ).then((items) => {
          this.removeReaction(emoji, user.id);

          this.currentItems = items;

          this.generateEmbed();

          this.editMessage(this.ctx);
        });
      });

      collector.on("error", (e: Error) => {
        reject(e);
      });

      collector.on("end", () => {
        resolve(undefined);
      });

      if (this.options.totalPages > -1 && this.options.totalPages > 2)
        await sentMessage.react(this.firstArrow);
      if (this.options.totalPages > 1) await sentMessage.react(this.leftArrow);

      if (this.options.totalPages > 1) await sentMessage.react(this.rightArrow);
      if (this.options.totalPages > -1 && this.options.totalPages > 2)
        await sentMessage.react(this.lastArrow);
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
