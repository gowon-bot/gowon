import { sleep } from "../../helpers";
import { Params } from "../../services/LastFM/LastFMService.types";

export function isPaginator<T = any>(
  value: Paginator<T> | any
): value is Paginator<T> {
  return value instanceof Paginator;
}

export class Paginator<ParamsT extends Params = Params, ResponseT = any> {
  currentPage: number = 0;

  constructor(
    private readonly method: (ctx: any, params: ParamsT) => Promise<ResponseT>,
    public maxPages: number,
    private params: ParamsT,
    private ctx: any
  ) {}

  async getNext(): Promise<ResponseT | undefined> {
    this.currentPage++;

    if (this.currentPage > this.maxPages) return;

    return await this.method(this.ctx, {
      ...this.params,
      page: this.currentPage,
    });
  }

  async *iterator() {
    for (let page = this.currentPage + 1; page <= this.maxPages; page++) {
      this.currentPage += 1;
      yield await this.method(this.ctx, {
        ...this.params,
        page: this.currentPage,
      });
    }
  }

  async *pagesIterator(
    method: (ctx: any, params: ParamsT) => Promise<ResponseT>
  ) {
    for (let page = this.currentPage + 1; page <= this.maxPages; page++) {
      yield await method(this.ctx, {
        ...this.params,
        page,
      });
    }
  }

  private generatePages(
    method: (ctx: any, params: ParamsT) => Promise<ResponseT>
  ): Promise<ResponseT>[] {
    let pages = [];

    for (let page = this.currentPage + 1; page <= this.maxPages; page++) {
      pages.push(
        method(this.ctx, {
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
    waitInterval?: number;
  }): Promise<ResponseT>;
  async getAll<V = any>(options: {
    groupOn?: string;
    concurrent?: boolean;
    waitInterval?: number;
  }): Promise<V[]>;
  async getAll<V = any>(options: {
    concurrent: boolean;
    waitInterval?: number;
  }): Promise<V[]>;
  async getAll<V = any>(
    options: {
      groupOn?: string;
      concatTo?: string;
      concurrent?: boolean;
      waitInterval?: number;
    } = {
      concurrent: true,
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

    if (options.concurrent) {
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

  async getAllToConcatonable(
    options: {
      concurrent?: boolean;
      waitInterval?: number;
    } = {}
  ): Promise<ResponseT> {
    let result: ResponseT;

    const eachFunction = (response: ResponseT) => {
      if (result) {
        (result as any).concat(response);
      } else {
        result = response;
      }
    };

    if (options.concurrent) {
      for await (let page of this.pagesIterator(this.method)) {
        eachFunction(page);
        if (options.waitInterval) await sleep(options.waitInterval);
      }
    } else {
      (await Promise.all(this.generatePages(this.method))).forEach(
        eachFunction
      );
    }

    return result!;
  }
}
