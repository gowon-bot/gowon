import Axios from "axios";
import cheerio from "cheerio";

export class Scraper {
  constructor(protected baseURL: string) {}

  async scrape(path: string): Promise<cheerio.Root> {
    let response = await Axios.get(this.baseURL + path);

    return cheerio.load(response.data);
  }
}
