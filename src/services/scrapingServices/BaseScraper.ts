import { BaseService } from "../BaseService";
import axios, { AxiosInstance } from "axios";
import { Logger } from "../../lib/Logger";
import cheerio from "cheerio";

export class BaseScraper extends BaseService {
  url: string;
  axios: AxiosInstance;

  constructor(logger: Logger | undefined, url: string) {
    super(logger);
    this.url = url;

    this.axios = axios.create();
  }

  protected async fetch(path: string): Promise<CheerioStatic> {
    let response = await this.axios.get(this.url + path);
    return cheerio.load(response.data);
  }
}
