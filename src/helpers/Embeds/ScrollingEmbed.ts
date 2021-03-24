import {
  EmbedField,
  Emoji,
  Message,
  MessageEmbed,
  MessageReaction,
  ReactionCollector,
  User,
} from "discord.js";
import { ReactionCollectorFilter } from "../discord";

export interface ScrollingEmbedOptions {
  initialItems: string | EmbedField[];
  totalPages: number;
  totalItems: number;
  startingPage: number;
  embedDescription: string;
  itemName: string;
  itemNamePlural: string;
}

function isEmbedFields(value: string | EmbedField[]): value is EmbedField[] {
  return !!((value[0] as EmbedField)?.name && (value[0] as EmbedField)?.value);
}

type OnPageChangeCallback = (
  page: number,
  message: Message,
  emoji: Emoji,
  userId: string
) => string | Promise<string> | EmbedField[] | Promise<EmbedField[]>;

export class ScrollingEmbed {
  private sentMessage!: Message;
  private currentPage = 1;
  private currentItems: string | EmbedField[];
  private options: ScrollingEmbedOptions;
  private onPageChangeCallback: OnPageChangeCallback = () => "";

  constructor(
    private message: Message,
    private embed: MessageEmbed,
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
      },
      options
    );

    this.currentItems = this.options.initialItems;
    this.currentPage = this.options.startingPage;
  }

  public async send() {
    this.generateEmbed();

    this.sentMessage = await this.message.channel.send(this.embed);

    await this.react();
  }

  public async customSend(
    sendCallback:
      | ((embed: MessageEmbed) => Message)
      | ((embed: MessageEmbed) => Promise<Message>)
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
      return user.id === this.message.author.id;
    };
  }

  private generateEmbed() {
    this.embed.setFooter(this.generateFooter());

    if (isEmbedFields(this.currentItems)) {
      this.embed.setDescription(this.options.embedDescription);
      this.embed.fields = [];
      this.currentItems.forEach((item) => this.embed.addFields(item));
    } else {
      this.embed.setDescription(
        `${this.options.embedDescription}\n${this.currentItems}`
      );
    }
  }

  private generateFooter(): string {
    let footer = "";

    if (this.options.totalPages >= 0) {
      footer += `Page ${this.currentPage} of ${this.options.totalPages}`;
    }

    if (this.options.totalItems >= 0) {
      if (this.options.totalPages >= 0) footer += " • ";

      footer += `${this.options.totalItems} ${
        this.options.totalItems === 1
          ? this.options.itemName
          : this.options.itemNamePlural
      }`;
    }

    return footer;
  }

  private async react() {
    return new Promise(async (resolve, reject) => {
      if (this.options.totalPages < 2) return;

      const collector = new ReactionCollector(this.sentMessage, this.filter, {
        time: 2 * 60 * 1000,
      });

      collector.on("collect", async (reaction: MessageReaction, user: User) => {
        const emoji = reaction.emoji;

        this.removeReaction(emoji, user.id);

        let page = this.currentPage;

        if (emoji.name === "⏮️" && page !== 1) page = 1;
        if (emoji.name === "◀️" && page !== 1) page--;
        if (emoji.name === "▶️" && page !== this.options.totalPages) page++;
        if (emoji.name === "⏭️" && this.currentPage !== this.options.totalPages)
          page = this.options.totalPages;

        if (page === this.currentPage) return;

        this.currentPage = page;

        Promise.resolve(
          this.onPageChangeCallback(
            this.currentPage,
            this.message,
            emoji,
            user.id
          )
        ).then((items) => {
          this.currentItems = items;

          this.generateEmbed();

          this.sentMessage.edit({ embed: this.embed });
        });
      });

      collector.on("error", (e: Error) => {
        reject(e);
      });

      collector.on("end", () => {
        resolve(undefined);
      });

      if (this.options.totalPages > -1 && this.options.totalPages > 2)
        await this.sentMessage.react(`⏮️`);
      if (this.options.totalPages > 1) await this.sentMessage.react(`◀️`);

      if (this.options.totalPages > 1) await this.sentMessage.react(`▶️`);
      if (this.options.totalPages > -1 && this.options.totalPages > 2)
        await this.sentMessage.react(`⏭️`);
    });
  }

  private async removeReaction(emoji: Emoji, userId: string) {
    if (this.message.guild?.me?.hasPermission("MANAGE_MESSAGES"))
      await this.sentMessage!.reactions.resolve(emoji.name)!.users.remove(
        userId
      );
  }
}
