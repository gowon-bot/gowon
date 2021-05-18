import { BaseScraper, ScrapingError } from "./BaseScraper";
import { parseDate } from "../../helpers/date";
import { Logger } from "../../lib/Logger";
import { toInt } from "../../helpers/lastFM";

export interface TopTrack {
  track: string;
  playcount: number;
}

export interface TopAlbum {
  album: string;
  playcount: number;
}

interface Metadata {
  [key: string]: string;
}

export interface Top<T> {
  items: T[];
  total: number;
  count?: number;
}

export class LastFMScraper extends BaseScraper {
  constructor(logger?: Logger) {
    super(logger, "https://last.fm/");
  }

  // https://www.last.fm/user/flushed_emoji/library/music/Red+Velvet
  async artistTopTracks(
    username: string,
    artist: string
  ): Promise<Top<TopTrack>> {
    let $ = await this.fetch(
      "user/" +
        encodeURIComponent(username) +
        "/library/music/" +
        encodeURIComponent(artist)
    );

    let metadata = this.getMetadataItems($);

    let topTracks = [] as TopTrack[];

    let artistChart = $($("section.clearfix").get(1));
    artistChart
      .find("tr")
      .slice(1)
      .each((_, el) => {
        let element = $(el);

        let track = element.find(".chartlist-name > a").text();
        let playcountElement = element
          .find(".chartlist-count-bar-value")
          .text()
          .trim();

        let playcount = toInt(playcountElement);

        topTracks.push({ track, playcount });
      });

    if (!topTracks.length)
      throw new ScrapingError(
        `it looks like you don't have any scrobbles of ${artist}!`
      );

    return {
      items: topTracks,
      total: toInt(metadata.Scrobbles),
      count: toInt(metadata.Tracks),
    };
  }

  async artistTopAlbums(
    username: string,
    artist: string
  ): Promise<Top<TopAlbum>> {
    let $ = await this.fetch(
      "user/" +
        encodeURIComponent(username) +
        "/library/music/" +
        encodeURIComponent(artist)
    );

    let metadata = this.getMetadataItems($);

    let topAlbums = [] as TopAlbum[];

    let albumChart = $($("section.clearfix").get(0));

    albumChart
      .find("tr")
      .slice(1)
      .each((_, el) => {
        let element = $(el);

        let album = element.find(".chartlist-name > a").text();
        let playcount = toInt(
          element.find(".chartlist-count-bar-value").text().trim()
        );

        topAlbums.push({ album, playcount });
      });

    if (!topAlbums.length)
      throw new ScrapingError(
        `it looks like you don't have any scrobbles of any albums by ${artist}!`
      );

    return {
      items: topAlbums,
      total: toInt(metadata.Scrobbles),
      count: toInt(metadata.Albums),
    };
  }

  async albumTopTracks(
    username: string,
    artist: string,
    album: string
  ): Promise<Top<TopTrack>> {
    let $ = await this.fetch(
      "user/" +
        encodeURIComponent(username) +
        "/library/music/" +
        encodeURIComponent(artist) +
        "/" +
        encodeURIComponent(album)
    );

    let metadata = this.getMetadataItems($);

    let topTracks = [] as TopTrack[];

    let trackChart = $($(".chartlist").get(0));

    trackChart
      .find("tr")
      .slice(1)
      .each((_, el) => {
        let element = $(el);

        let track = element.find(".chartlist-name > a").text();
        let playcount = toInt(
          element.find(".chartlist-count-bar-value").text().trim()
        );

        topTracks.push({ track, playcount });
      });

    if (!topTracks.length)
      throw new ScrapingError(
        `it looks like you don't have any scrobbles of ${album} by ${artist}!`
      );

    return { items: topTracks, total: toInt(metadata.Scrobbles) };
  }

  async lastScrobbled(
    username: string,
    artist: string,
    track: string
  ): Promise<Date | string | undefined> {
    let $ = await this.fetch(
      "user/" +
        encodeURIComponent(username) +
        "/library/music/" +
        encodeURIComponent(artist) +
        "/_/" +
        encodeURIComponent(track)
    );

    let trackChart = $($(".chartlist").get(0));

    let lastScrobbled = $(trackChart.find("tr").get(1)).find(
      ".chartlist-timestamp > span"
    );

    return (
      parseDate(
        lastScrobbled.text().trim(),
        "d MMM h:mma",
        "d MMM yyyy, h:mma"
      ) || lastScrobbled.text().trim()
    );
  }

  private getMetadataItems(page: cheerio.Root): Metadata {
    let items = page(".metadata-list > .metadata-item").toArray();

    return items.reduce((acc, val) => {
      let key = page(val).find(".metadata-title").text();
      let value = page(val).find(".metadata-display").text();

      acc[key] = value;

      return acc;
    }, {} as Metadata);
  }
}
