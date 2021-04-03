import { chunkArray } from "../helpers";

type OnPageRequestCallback<T> =
  | ((pageNumber: number) => T[])
  | ((pageNumber: number) => Promise<T[]>);

export class PaginatedCacheManager<T> {
  items: T[][] = [];

  constructor(private onPageRequest: OnPageRequestCallback<T>) {}

  public cacheInitial(items: T[], pageSize = 10): PaginatedCacheManager<T> {
    this.items = chunkArray(items, pageSize);
    return this;
  }

  public async getPage(pageNumber: number): Promise<T[]> {
    const adjustedPageNumber = pageNumber - 1;

    const cachedPage = this.items[adjustedPageNumber];

    if (cachedPage) {
      return cachedPage;
    }

    this.items[adjustedPageNumber] = await Promise.resolve(
      this.onPageRequest(pageNumber)
    );

    return this.items[adjustedPageNumber];
  }
}
