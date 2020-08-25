import { Params } from "../services/LastFMService.types";

export class Paginator {
  currentPage: number = 0;

  constructor(
    private readonly method: (params: any) => Promise<any>,
    public readonly maxPages: number,
    private params: Params
  ) {}

  async getNext(): Promise<any> {
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

  async getAll(options: { groupOn?: string } = {}): Promise<any> {
    let results = [];

    for (let page = this.currentPage; page <= this.maxPages; page++) {
      let response = await this.method({
        ...this.params,
        page,
      });

      if (options.groupOn) {
        results.push(response[options.groupOn]);
      } else {
        results.push(response);
      }
    }

    return results;
  }
}
