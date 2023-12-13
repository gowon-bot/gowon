import { EmbedFieldData } from "discord.js";
import { GowonContext } from "../../context/Context";
import { EmbedComponent } from "../framework/EmbedComponent";
import {
  ScrollingEmbed,
  ScrollingEmbedOptions,
  isEmbedFields,
} from "./ScrollingEmbed";

export interface SimpleScrollingEmbedOptions<T> {
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

export class SimpleScrollingEmbed<T> extends ScrollingEmbed {
  constructor(
    ctx: GowonContext,
    embed: EmbedComponent,
    private simpleOptions: SimpleScrollingEmbedOptions<T>
  ) {
    super(
      ctx,
      embed,
      Object.assign(
        {
          totalItems: simpleOptions.items.length,
          totalPages: getTotalPages(simpleOptions),
          initialItems: renderItemsFromPage(simpleOptions, 1),
        },
        simpleOptions.overrides || {}
      )
    );

    this.onPageChange((page) => {
      return renderItemsFromPage(this.simpleOptions, page);
    });
  }
}

function getTotalPages(options: SimpleScrollingEmbedOptions<any>): number {
  return Math.ceil(options.items.length / options.pageSize);
}

function renderItemsFromPage(
  options: SimpleScrollingEmbedOptions<any>,
  page: number
): string | EmbedFieldData[] {
  const offset = (page - 1) * options.pageSize;

  const items = options.items.slice(offset, page * options.pageSize);

  return options.pageRenderer
    ? options.pageRenderer(items, { page, offset })
    : !isEmbedFields(items)
    ? items.join("\n")
    : items;
}
