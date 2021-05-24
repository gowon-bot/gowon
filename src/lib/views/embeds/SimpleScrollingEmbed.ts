import { Message, MessageEmbed } from "discord.js";
import { ScrollingEmbed, ScrollingEmbedOptions } from "./ScrollingEmbed";

export interface SimpleOptions<T> {
  items: Array<T>;
  pageSize: number;
  /**
   * Allows the passing in of a template to render the items in
   */
  pageRenderer?: (
    items: T[],
    pageInfo: { page: number; offset: number }
  ) => string;
}

export class SimpleScrollingEmbed<T> {
  scrollingEmbed: ScrollingEmbed;

  constructor(
    message: Message,
    embed: MessageEmbed,
    private options: SimpleOptions<T>,
    overrideOptions: Partial<ScrollingEmbedOptions> = {}
  ) {
    this.scrollingEmbed = new ScrollingEmbed(
      message,
      embed,
      Object.assign(
        {
          totalItems: options.items.length,
          totalPages: this.getTotalPages(),
          initialItems: this.renderItemsFromPage(1),
        },
        overrideOptions
      )
    );

    this.scrollingEmbed.onPageChange((page) => {
      return this.renderItemsFromPage(page);
    });
  }

  public async send() {
    return this.scrollingEmbed.send();
  }

  private getTotalPages(): number {
    return Math.ceil(this.options.items.length / this.options.pageSize);
  }

  private renderItemsFromPage(page: number): string {
    const offset = (page - 1) * this.options.pageSize;

    const items = this.options.items.slice(
      offset,
      page * this.options.pageSize
    );

    return this.options.pageRenderer
      ? this.options.pageRenderer(items, { page, offset })
      : items.join("\n");
  }
}
