import { sleep } from "../helpers";
import { Params } from "../services/LastFM/LastFMService.types";

export class Paginator<ParamsT extends Params = Params, ResponseT = any> {
  currentPage: number = 0;

  constructor(
    private readonly method: (params: ParamsT) => Promise<ResponseT>,
    public maxPages: number,
    private params: ParamsT
  ) {}

  async getNext(): Promise<ResponseT | undefined> {
    this.currentPage++;

    if (this.currentPage > this.maxPages) return;

    return await this.method({
      ...this.params,
      page: this.currentPage,
    });
  }

  async *iterator() {
    for (let page = this.currentPage + 1; page <= this.maxPages; page++) {
      this.currentPage += 1;
      yield await this.method({
        ...this.params,
        page: this.currentPage,
      });
    }
  }

  async *backwardsIterator() {
    let startingPage = this.currentPage;

    for (let page = this.maxPages; page > startingPage; page--) {
      this.currentPage++;

      yield await this.method({
        ...this.params,
        page,
      });
    }
  }

  async *pagesIterator(method: (params: ParamsT) => Promise<ResponseT>) {
    for (let page = this.currentPage + 1; page <= this.maxPages; page++) {
      yield await method({
        ...this.params,
        page,
      });
    }
  }

  private generatePages(
    method: (params: ParamsT) => Promise<ResponseT>
  ): Promise<ResponseT>[] {
    let pages = [];

    for (let page = this.currentPage + 1; page <= this.maxPages; page++) {
      pages.push(
        method({
          ...this.params,
          page,
        })
      );
    }

    return pages;
  }

  async getAll<V>(options: {
    concatTo?: string;
    consecutive?: boolean;
    waitInterval?: number;
  }): Promise<ResponseT>;
  async getAll<V = any>(options: {
    groupOn?: string;
    consecutive?: boolean;
    waitInterval?: number;
  }): Promise<V[]>;
  async getAll<V = any>(options: {
    consecutive: boolean;
    waitInterval?: number;
  }): Promise<V[]>;
  async getAll<V = any>(
    options: {
      groupOn?: string;
      concatTo?: string;
      consecutive?: boolean;
      waitInterval?: number;
    } = {
      consecutive: true,
    }
  ): Promise<V[] | ResponseT> {
    let results = [] as V[];
    let result: ResponseT | undefined;

    const eachFunction = (response: any) => {
      if (options.groupOn) {
        results.push(response[options.groupOn]);
      } else if (options.concatTo) {
        if (!result) result = response;
        else
          ((result as any)[options.concatTo] as Array<unknown>).push(
            ...response[options.concatTo]
          );
      } else {
        results.push(response);
      }
    };

    if (options.consecutive) {
      for await (let page of this.pagesIterator(this.method)) {
        eachFunction(page);
        if (options.waitInterval) await sleep(options.waitInterval);
      }
    } else {
      (await Promise.all(this.generatePages(this.method))).forEach(
        eachFunction
      );
    }

    if (result) {
      return result as ResponseT;
    } else {
      return results as V[];
    }
  }
}
