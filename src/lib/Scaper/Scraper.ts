import Axios from "axios";
import cheerio from "cheerio";

export class Scraper {
  baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async scrape(path: string): Promise<CheerioStatic> {
    let response = await Axios.get(this.baseURL + path);

    return cheerio.load(response.data);
  }
}
