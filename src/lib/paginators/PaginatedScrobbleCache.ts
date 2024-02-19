import { ServiceRegistry } from "../../services/ServicesRegistry";
import {
  LilacPagination,
  LilacScrobble,
  LilacScrobbleFilters,
  LilacScrobblesPage,
} from "../../services/lilac/LilacAPIService.types";
import { LilacLibraryService } from "../../services/lilac/LilacLibraryService";
import { GowonContext } from "../context/Context";
import { displayNumberedList } from "../ui/displays";
import { EmbedView } from "../ui/views/EmbedView";
import { ScrollinViewOptions, ScrollingView } from "../ui/views/ScrollingView";
import { PaginatedCache } from "./PaginatedCache";

export class PaginatedLilacScrobbleCache extends PaginatedCache<LilacScrobble> {
  private get lilacLibraryService() {
    return ServiceRegistry.get(LilacLibraryService);
  }

  constructor(
    private ctx: GowonContext,
    private filters: LilacScrobbleFilters,
    private pageSize = 15
  ) {
    super(async (page) => {
      const response = await this.lilacLibraryService.scrobbleList(ctx, {
        ...filters,
        pagination: { page, perPage: pageSize },
      });

      return response.scrobbles;
    });
  }

  async getFirstPage(): Promise<LilacScrobblesPage> {
    const firstPage = await this.lilacLibraryService.scrobbleList(this.ctx, {
      ...this.filters,
      pagination: { page: 1, perPage: this.pageSize },
    });

    this.cacheInitial(firstPage.scrobbles, this.pageSize);

    return firstPage;
  }

  async generateScrollingEmbed(
    embed: EmbedView,
    firstPage: LilacScrobblesPage,
    generateTableRow: (scrobble: LilacScrobble) => string,
    overrides: Partial<ScrollinViewOptions> = {}
  ): Promise<ScrollingView> {
    const scrollingEmbed = new ScrollingView(this.ctx, embed, {
      initialItems: this.generateTable(
        await this.getPage(1),
        firstPage.pagination,
        1,
        generateTableRow
      ),
      totalPages: Math.ceil(firstPage.pagination.totalPages),
      totalItems: firstPage.pagination.totalItems,
      itemName: "scrobble",
      ...overrides,
    });

    scrollingEmbed.onPageChange(async (page) =>
      this.generateTable(
        await this.getPage(page),
        firstPage.pagination,
        page,
        generateTableRow
      )
    );

    return scrollingEmbed;
  }

  private generateTable(
    plays: LilacScrobble[],
    pageInfo: LilacPagination,
    page: number,
    generateTableRow: (scrobble: LilacScrobble) => string
  ): string {
    return displayNumberedList(
      plays.map((p) => generateTableRow(p)),
      pageInfo.perPage * (page - 1)
    );
  }
}
