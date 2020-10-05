import { Params } from "../services/LastFM/LastFMService.types";

export class Paginator<T extends Params = Params, U = any> {
  currentPage: number = 0;

  constructor(
    private readonly method: (params: T) => Promise<U>,
    public maxPages: number,
    private params: T
  ) {}

  async getNext(): Promise<U | undefined> {
    this.currentPage++;

    if (this.currentPage > this.maxPages) return;

    return await this.method({
      ...this.params,
      page: this.currentPage,
    });
  }

  *iterator() {
    for (let page = this.currentPage + 1; page <= this.maxPages; page++) {
      this.currentPage += 1;
      yield this.method({
        ...this.params,
        page: this.currentPage,
      });
    }
  }

  private generatePages(method: (params: T) => Promise<U>): Promise<U>[] {
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
    concurrent?: boolean;
  }): Promise<U>;
  async getAll<V = any>(options: {
    groupOn?: string;
    concurrent?: boolean;
  }): Promise<V[]>;
  async getAll<V = any>(options: { concurrent: boolean }): Promise<V[]>;
  async getAll<V = any>(
    options: { groupOn?: string; concatTo?: string; concurrent?: boolean } = {
      concurrent: true,
    }
  ): Promise<V[] | U> {
    let results = [] as V[];
    let result: U | undefined;

    const eachFunction = (response: any) => {
      console.log(response);

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

    if (options.concurrent) {
      for await (let page of this.generatePages(this.method)) {
        eachFunction(page);
      }
    } else {
      (await Promise.all(this.generatePages(this.method))).forEach(
        eachFunction
      );
    }

    if (result) {
      return result as U;
    } else {
      return results as V[];
    }
  }
}
