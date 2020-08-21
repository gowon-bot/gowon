import { BaseService } from "../BaseService";
import axios, { AxiosInstance } from "axios";
import { Logger } from "../../lib/Logger";
import cheerio from "cheerio";

export class BaseScraper extends BaseService {
  axios: AxiosInstance;

  constructor(logger: Logger | undefined, private url: string) {
    super(logger);

    this.axios = axios.create();
  }

  protected async fetch(path: string): Promise<CheerioStatic> {
    let response = await this.axios.get(this.url + path);
    return cheerio.load(response.data);
  }
}
