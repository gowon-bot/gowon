import { BaseService, BaseServiceContext } from "../BaseService";
import axios from "axios";
import cheerio from "cheerio";
import chalk from "chalk";
import { ClientError } from "../../errors";

export class ScrapingError extends ClientError {
  name = "ScrapingError";

  constructor(message: string) {
    super(message);
  }
}

type BaseScraperContext = BaseServiceContext & { url: string };

export class BaseScraper extends BaseService<BaseScraperContext> {
  axios = axios.create();

  protected async fetch(
    ctx: BaseScraperContext,
    path: string
  ): Promise<cheerio.Root> {
    this.log(ctx, chalk`Made scraping request for {cyan '${ctx.url + path}'}`);
    let response = await this.axios.get(ctx.url + path);
    return cheerio.load(response.data);
  }
}
