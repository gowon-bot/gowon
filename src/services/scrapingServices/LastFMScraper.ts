import { BaseScraper } from "./BaseScraper";
import { LastFMService } from "../LastFMService";
import { generateTimeRange, parseDate } from "../../helpers/date";

export interface TopTrack {
  track: string;
  playcount: number;
}

export interface TopAlbum {
  album: string;
  playcount: number;
}

export class LastFMScraper extends BaseScraper {
  constructor(lastFMService: LastFMService) {
    super(lastFMService.logger, "https://last.fm/");
  }

  // https://www.last.fm/user/flushed_emoji/library/music/Red+Velvet
  async artistTopTracks(username: string, artist: string): Promise<TopTrack[]> {
    let $ = await this.fetch(
      "user/" +
        encodeURIComponent(username) +
        "/library/music/" +
        encodeURIComponent(artist)
    );

    let topTracks = [] as TopTrack[];

    let artistChart = $($("section.clearfix").get(1));
    artistChart
      .find("tr")
      .slice(1)
      .each((_, el) => {
        let element = $(el);

        let track = element.find(".chartlist-name > a").text();
        let playcount = element
          .find(".chartlist-count-bar-value")
          .text()
          .trim()
          .toInt();

        topTracks.push({ track, playcount });
      });

    return topTracks;
  }

  async artistTopAlbums(username: string, artist: string): Promise<TopAlbum[]> {
    let $ = await this.fetch(
      "user/" +
        encodeURIComponent(username) +
        "/library/music/" +
        encodeURIComponent(artist)
    );

    let topAlbums = [] as TopAlbum[];

    let albumChart = $($("section.clearfix").get(0));

    albumChart
      .find("tr")
      .slice(1)
      .each((_, el) => {
        let element = $(el);

        let album = element.find(".chartlist-name > a").text();
        let playcount = element
          .find(".chartlist-count-bar-value")
          .text()
          .trim()
          .toInt();

        topAlbums.push({ album, playcount });
      });

    return topAlbums;
  }

  // https://www.last.fm/user/flushed_emoji/library/music/Red+Velvet/%E2%80%98The+ReVe+Festival%E2%80%99+Day+1
  async albumTopTracks(
    username: string,
    artist: string,
    album: string
  ): Promise<TopTrack[]> {
    let $ = await this.fetch(
      "user/" +
        encodeURIComponent(username) +
        "/library/music/" +
        encodeURIComponent(artist) +
        "/" +
        encodeURIComponent(album)
    );

    let topTracks = [] as TopTrack[];

    let trackChart = $($(".chartlist").get(0));

    trackChart
      .find("tr")
      .slice(1)
      .each((_, el) => {
        let element = $(el);

        let track = element.find(".chartlist-name > a").text();
        let playcount = element
          .find(".chartlist-count-bar-value")
          .text()
          .trim()
          .toInt();

        topTracks.push({ track, playcount });
      });

    return topTracks;
  }

  // https://www.last.fm/user/flushed_emoji/library/music/Red+Velvet/_/Sunny+Side+Up!
  async lastScrobbled(
    username: string,
    artist: string,
    track: string
  ): Promise<Date | undefined> {
    let $ = await this.fetch(
      "user/" +
        encodeURIComponent(username) +
        "/library/music/" +
        encodeURIComponent(artist) +
        "/_/" +
        encodeURIComponent(track)
    );

    let trackChart = $($(".chartlist").get(0));

    let lastScrobbled = $(trackChart.find("tr").get(2)).find(
      ".chartlist-timestamp > span"
    );

    // 6 Jul 2019, 9:35pm
    return parseDate(
      lastScrobbled.text().trim(),
      "D MMM h:mma",
      "D MMM YYYY, h:mma",
      (string: string) => {
        return generateTimeRange(string, { noFallback: true }).from;
      }
    );
  }
}
