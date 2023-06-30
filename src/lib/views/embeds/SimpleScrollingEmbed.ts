import { EmbedBuilder, EmbedField } from "discord.js";
import { GowonContext } from "../../context/Context";
import {
  ScrollingEmbed,
  ScrollingEmbedOptions,
  isEmbedFields,
} from "./ScrollingEmbed";

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

  overrides?: Partial<ScrollingEmbedOptions>;
}

export class SimpleScrollingEmbed<T> {
  scrollingEmbed: ScrollingEmbed;

  constructor(
    ctx: GowonContext,
    embed: EmbedBuilder,
    private options: SimpleOptions<T>
  ) {
    this.scrollingEmbed = new ScrollingEmbed(
      ctx,
      embed,
      Object.assign(
        {
          totalItems: options.items.length,
          totalPages: this.getTotalPages(),
          initialItems: this.renderItemsFromPage(1),
        },
        options.overrides || {}
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

  private renderItemsFromPage(page: number): string | EmbedField[] {
    const offset = (page - 1) * this.options.pageSize;

    const items = this.options.items.slice(
      offset,
      page * this.options.pageSize
    );

    return this.options.pageRenderer
      ? this.options.pageRenderer(items, { page, offset })
      : !isEmbedFields(items)
      ? items.join("\n")
      : items;
  }
}
