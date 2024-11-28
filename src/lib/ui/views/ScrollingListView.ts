import { EmbedFieldData } from "discord.js";
import { GowonContext } from "../../context/Context";
import { EmbedView } from "./EmbedView";
import {
  ScrollingView,
  ScrollingViewOptions,
  isEmbedFields,
} from "./ScrollingView";

export interface ScrollingListViewOptions<T> {
  items: Array<T>;
  pageSize: number;
  /**
   * Allows the passing in of a template to render the items in
   */
  pageRenderer?: (
    items: T[],
    pageInfo: { page: number; offset: number }
  ) => string;

  overrides?: Partial<ScrollingViewOptions>;
}

export class ScrollingListView<T> extends ScrollingView {
  constructor(
    ctx: GowonContext,
    embed: EmbedView,
    private listOptions: ScrollingListViewOptions<T>
  ) {
    super(
      ctx,
      embed,
      Object.assign(
        {
          totalItems: listOptions.items.length,
          totalPages: getTotalPages(listOptions),
          initialItems: renderItemsFromPage(listOptions, 1),
        },
        listOptions.overrides || {}
      )
    );

    this.onPageChange((page) => {
      return renderItemsFromPage(this.listOptions, page);
    });
  }
}

function getTotalPages(options: ScrollingListViewOptions<any>): number {
  return Math.ceil(options.items.length / options.pageSize);
}

function renderItemsFromPage(
  options: ScrollingListViewOptions<any>,
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
