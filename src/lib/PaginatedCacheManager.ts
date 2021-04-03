function chunkArray<T = any>(
  array: Array<T>,
  chunkSize: number
): Array<Array<T>> {
  return Array(Math.ceil(array.length / chunkSize))
    .fill(0)
    .map((_, index) => index * chunkSize)
    .map((begin) => array.slice(begin, begin + chunkSize));
}

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

const fakeItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const pageSize = 2;

const getFakeItems = (pageNumber: number) => {
  console.log(`Getting fake items (page ${pageNumber})...`);
  return fakeItems.slice(pageSize * (pageNumber - 1), pageSize * pageNumber);
};

const paginatedCacheManager = new PaginatedCacheManager(getFakeItems);

paginatedCacheManager.cacheInitial(fakeItems.slice(0, 6), 2);

(async () => {
  console.log(await paginatedCacheManager.getPage(1));
  console.log(await paginatedCacheManager.getPage(2));
  console.log(await paginatedCacheManager.getPage(3));
  console.log(await paginatedCacheManager.getPage(4));
  console.log(await paginatedCacheManager.getPage(4));
})();
