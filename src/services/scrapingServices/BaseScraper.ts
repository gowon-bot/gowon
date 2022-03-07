import { BaseService } from "../BaseService";
import axios from "axios";
import cheerio from "cheerio";
import chalk from "chalk";
import { ClientError } from "../../errors/errors";
import { GowonContext } from "../../lib/context/Context";

export class ScrapingError extends ClientError {
  name = "ScrapingError";

  constructor(message: string) {
    super(message);
  }
}

type BaseScraperContext = GowonContext<{ constants: { url: string } }>;

export class BaseScraper extends BaseService<BaseScraperContext> {
  axios = axios.create();

  protected async fetch(
    ctx: BaseScraperContext,
    path: string
  ): Promise<cheerio.Root> {
    this.log(
      ctx,
      chalk`Made scraping request for {cyan '${ctx.constants.url + path}'}`
    );
    let response = await this.axios.get(ctx.constants.url + path);
    return cheerio.load(response.data);
  }
}
