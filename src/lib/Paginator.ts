import { Params } from "../services/LastFM/LastFMService.types";

export class Paginator {
  currentPage: number = 0;

  constructor(
    private readonly method: (params: any) => Promise<any>,
    public readonly maxPages: number,
    private params: Params
  ) {}

  async getNext<T>(): Promise<T | undefined> {
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

  private generatePages<T>(method: (params: any) => Promise<T>): Promise<T>[] {
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

  async getAll<T = any>(options: {
    concatTo?: string;
    concurrent?: boolean;
  }): Promise<T>;
  async getAll<T = any>(options: {
    groupOn?: string;
    concurrent?: boolean;
  }): Promise<T[]>;
  async getAll<T = any>(options: { concurrent: boolean }): Promise<T[]>;
  async getAll<T = any>(
    options: { groupOn?: string; concatTo?: string; concurrent?: boolean } = {
      concurrent: true,
    }
  ): Promise<T[] | T> {
    let results = [] as T[];
    let result: T | undefined;

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
      return result;
    } else {
      return results as T[];
    }
  }
}
