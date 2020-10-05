import { MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay } from "../../../helpers";
import { LinkConsolidator } from "../../../helpers/lastFM";
import { LineConsolidator } from "../../../lib/LineConsolidator";

export default class TrackInfo extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["tri"];
  description = "Display some information about a track";
  usage = ["", "artist | track"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
  };

  lineConsolidator = new LineConsolidator();

  async run() {
    let artist = this.parsedArguments.artist as string,
      track = this.parsedArguments.track as string;

    if (!artist || !track) {
      let { senderUsername } = await this.parseMentionedUsername();

      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let [trackInfo, spotifyTrack] = await Promise.all([
      this.lastFMService.trackInfo({ artist, track }),
      this.spotifyService.searchTrack(artist, track),
    ]);

    this.tagConsolidator.addTags(trackInfo.toptags.tag);

    let linkConsolidator = new LinkConsolidator([
      LinkConsolidator.spotify(spotifyTrack?.external_urls?.spotify),
      LinkConsolidator.lastfm(trackInfo.url),
    ]);

    let duration = trackInfo.duration.toInt();

    this.lineConsolidator.addLines(
      (duration
        ? `_${numberDisplay(Math.ceil(duration / 60000), "minute")}_`
        : "") +
        (duration && trackInfo.album ? " - " : "") +
        trackInfo.album
        ? `from the album ${trackInfo.album.title.italic()}`
        : "",
      {
        shouldDisplay: !!(duration || trackInfo.album),
        string: "",
      },
      {
        shouldDisplay: !!trackInfo.wiki,
        string: this.scrubReadMore(trackInfo.wiki?.summary?.trimRight())!,
      },
      {
        shouldDisplay: this.tagConsolidator.hasTags(),
        string: `**Tags:** ${this.tagConsolidator.consolidate().join(" ‧ ")}`,
      },
      {
        shouldDisplay: linkConsolidator.hasLinks(),
        string: `**Links:** ${linkConsolidator.consolidate()}`,
      }
    );

    let embed = new MessageEmbed()
      .setTitle(trackInfo.name.italic() + " by " + trackInfo.artist.name.bold())
      .setDescription(this.lineConsolidator.consolidate())
      .addFields(
        {
          name: "Listeners",
          value: numberDisplay(trackInfo.listeners),
          inline: true,
        },
        {
          name: "Playcount",
          value: numberDisplay(trackInfo.playcount),
          inline: true,
        }
      )
      .setURL(trackInfo.url);

    this.send(embed);
  }
}
