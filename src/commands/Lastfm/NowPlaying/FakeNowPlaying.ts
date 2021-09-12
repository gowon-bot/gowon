import { CrownsService } from "../../../services/dbservices/CrownsService";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";
import { promiseAllSettled } from "../../../helpers";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { RecentTrack } from "../../../services/LastFM/converters/RecentTracks";
import { LogicError } from "../../../errors";
import { LinkGenerator } from "../../../helpers/lastFM";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

const args = {
  inputs: {
    otherWords: { index: { start: 0 } },
    querystring: { index: { start: 0 } },
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class FakeNowPlaying extends NowPlayingBaseCommand<typeof args> {
  idSeed = "april jinsol";

  aliases = ["track"];
  arguments = args;

  description =
    "Displays any given track as if it were your currently playing song";
  usage = ["search term", "artist | track"];

  crownsService = ServiceRegistry.get(CrownsService);

  async run() {
    let trackName = this.parsedArguments.track,
      artistName = this.parsedArguments.artist,
      querystring = this.parsedArguments.querystring || "";

    let { senderUsername, senderRequestable } = await this.parseMentions();

    if (querystring.includes("|") || !querystring.trim()) {
      if (!artistName || !trackName) {
        let nowPlaying = await this.lastFMService.nowPlaying(
          this.ctx,
          senderRequestable
        );

        if (!artistName) artistName = nowPlaying.artist;
        if (!trackName) trackName = nowPlaying.name;
      }
    } else {
      let results = await this.lastFMService.trackSearch(this.ctx, {
        track: querystring,
        limit: 1,
      });

      let track = results.tracks[0];

      if (!track) throw new LogicError("that track could not be found!");

      trackName = track.name;
      artistName = track.artist;
    }

    this.tagConsolidator.blacklistTags(artistName, trackName);

    let [artistInfo, trackInfo, crown] = await promiseAllSettled([
      this.lastFMService.artistInfo(this.ctx, {
        artist: artistName,
        username: senderRequestable,
      }),
      this.lastFMService.trackInfo(this.ctx, {
        artist: artistName,
        track: trackName,
        username: senderRequestable,
      }),
      this.crownsService.getCrownDisplay(this.ctx, artistName),
    ]);

    let { crownString, isCrownHolder } = await this.crownDetails(
      crown,
      this.author
    );

    if (trackInfo.value)
      this.tagConsolidator.addTags(trackInfo.value?.tags || []);
    if (artistInfo.value)
      this.tagConsolidator.addTags(artistInfo.value?.tags || []);

    const nowPlaying = this.fakeNowPlaying(
      artistInfo.value?.name || "",
      trackInfo.value?.name || "",
      trackInfo.value?.album?.name || "",
      trackInfo.value?.album?.images.get("large") || ""
    );

    let artistPlays = this.artistPlays(artistInfo, nowPlaying, isCrownHolder);
    let noArtistData = this.noArtistData(nowPlaying);
    let trackPlays = this.trackPlays(trackInfo);
    let tags = this.tagConsolidator
      .consolidateAsStrings(Infinity, false)
      .join(" ‧ ");

    let lineConsolidator = new LineConsolidator();
    lineConsolidator.addLines(
      // Top line
      {
        shouldDisplay: !!artistPlays && !!trackPlays && !!crownString,
        string: `${artistPlays} • ${trackPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !!artistPlays && !!trackPlays && !crownString,
        string: `${artistPlays} • ${trackPlays}`,
      },
      {
        shouldDisplay: !!artistPlays && !trackPlays && !!crownString,
        string: `${artistPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !!trackPlays && !!crownString,
        string: `${noArtistData} • ${trackPlays} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !trackPlays && !!crownString,
        string: `${noArtistData} • ${crownString}`,
      },
      {
        shouldDisplay: !artistPlays && !!trackPlays && !crownString,
        string: `${noArtistData} • ${trackPlays}`,
      },
      {
        shouldDisplay: !!artistPlays && !trackPlays && !crownString,
        string: `${artistPlays}`,
      },
      {
        shouldDisplay: !artistPlays && !trackPlays && !crownString,
        string: `${noArtistData}`,
      },
      // Second line
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: tags,
      }
    );

    let nowPlayingEmbed = this.nowPlayingEmbed(nowPlaying, senderUsername)
      .setFooter(lineConsolidator.consolidate())
      .setAuthor(
        `Track for ${senderUsername}`,
        this.author.avatarURL() || undefined,
        LinkGenerator.userPage(senderUsername)
      );

    let sentMessage = await this.send(nowPlayingEmbed);

    await this.easterEggs(sentMessage, nowPlaying);
  }

  private fakeNowPlaying(
    artistName: string,
    trackName: string,
    albumName: string,
    image: string
  ): RecentTrack {
    return new RecentTrack({
      artist: { "#text": artistName, mbid: "" },
      "@attr": { nowplaying: "0" },
      mbid: "",
      album: { mbid: "", "#text": albumName },
      image: [
        {
          size: "large",
          "#text": image,
        },
      ],
      streamable: "0",
      url: "",
      name: trackName,
      date: {
        uts: `${new Date().getTime()}`,
        "#text": "",
      },
    });
  }
}
