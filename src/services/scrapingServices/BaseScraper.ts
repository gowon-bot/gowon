import { BaseService } from "../BaseService";
import axios, { AxiosInstance } from "axios";
import { Logger } from "../../lib/Logger";
import cheerio from "cheerio";
import chalk from "chalk";
import { ClientError } from "../../errors";

export class ScrapingError extends ClientError {
  name = "ScrapingError";

  constructor(message: string) {
    super(message);
  }
}

export class BaseScraper extends BaseService {
  axios: AxiosInstance;

  constructor(logger: Logger | undefined, private url: string) {
    super(logger);

    this.axios = axios.create();
  }

  protected async fetch(path: string): Promise<cheerio.Root> {
    this.log(chalk`Made scraping request for {cyan '${this.url + path}'}`);
    let response = await this.axios.get(this.url + path);
    return cheerio.load(response.data);
  }
}
