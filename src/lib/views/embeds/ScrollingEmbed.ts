import {
  EmbedBuilder,
  EmbedField,
  Emoji,
  Message,
  MessageReaction,
  PermissionsBitField,
  ReactionCollector,
  User,
} from "discord.js";
import { ReactionCollectorFilter } from "../../../helpers/discord";
import { DiscordService } from "../../../services/Discord/DiscordService";
import { Sendable } from "../../../services/Discord/DiscordService.types";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { GowonContext } from "../../context/Context";
import { EmojiRaw } from "../../emoji/Emoji";

export interface ScrollingEmbedOptions {
  initialItems: string | EmbedField[];
  totalPages: number;
  totalItems: number;
  startingPage: number;
  embedDescription: string;
  itemName: string;
  itemNamePlural: string;

  customFooter: OnPageChangeCallback | string;
}

type FooterReturn = string | Promise<string | EmbedField[]> | EmbedField[];

export function isEmbedFields(
  value: string | EmbedField[] | any
): value is EmbedField[] {
  return !!((value[0] as EmbedField)?.name && (value[0] as EmbedField)?.value);
}

type OnPageChangeCallback = (page: number, totalPages: number) => FooterReturn;

export class ScrollingEmbed {
  private get discordService() {
    return ServiceRegistry.get(DiscordService);
  }

  private sentMessage!: Message;
  private currentPage = 1;
  private currentItems: string | EmbedField[];
  private options: ScrollingEmbedOptions;
  private onPageChangeCallback: OnPageChangeCallback = () => "";

  private readonly leftArrow = EmojiRaw.arrowLeft;
  private readonly rightArrow = EmojiRaw.arrowRight;
  private readonly lastArrow = EmojiRaw.arrowLast;
  private readonly firstArrow = EmojiRaw.arrowFirst;

  constructor(
    private ctx: GowonContext,
    private embed: EmbedBuilder,
    options: Partial<ScrollingEmbedOptions>
  ) {
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
  }

  public async send() {
    this.generateEmbed();

    this.sentMessage = await this.discordService.send(
      this.ctx,
      new Sendable(this.embed)
    );

    await this.react();
  }

  public async customSend(
    sendCallback:
      | ((embed: EmbedBuilder) => Message)
      | ((embed: EmbedBuilder) => Promise<Message>)
  ) {
    this.generateEmbed();

    this.sentMessage = await Promise.resolve(sendCallback(this.embed));

    await this.react();
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
    this.embed.setFooter({
      text: this.generateFooter() as string,
    });

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

  private generateFooter(): FooterReturn {
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

      footer += `${this.options.totalItems} ${
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

  private async react() {
    return new Promise(async (resolve, reject) => {
      if (this.options.totalPages < 2) return;

      const collector = new ReactionCollector(this.sentMessage, {
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

          this.sentMessage.edit({ embeds: [this.embed] });
        });
      });

      collector.on("error", (e: Error) => {
        reject(e);
      });

      collector.on("end", () => {
        resolve(undefined);
      });

      if (this.options.totalPages > -1 && this.options.totalPages > 2)
        await this.sentMessage.react(this.firstArrow);
      if (this.options.totalPages > 1)
        await this.sentMessage.react(this.leftArrow);

      if (this.options.totalPages > 1)
        await this.sentMessage.react(this.rightArrow);
      if (this.options.totalPages > -1 && this.options.totalPages > 2)
        await this.sentMessage.react(this.lastArrow);
    });
  }

  private async removeReaction(emoji: Emoji, userId: string) {
    if (
      this.ctx.guild?.members?.me?.permissions?.has(
        PermissionsBitField.Flags.ManageMessages
      )
    ) {
      await this.sentMessage!.reactions.resolve(
        (emoji.id ?? emoji.name)!
      )!.users.remove(userId);
    }
  }
}
