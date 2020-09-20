import { MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { LinkConsolidator } from "../../../helpers/lastFM";

export default class AlbumInfo extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["ali", "li", "als", "ls"];
  description = "Display some information about an album";
  usage = ["", "artist | album"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  async run() {
    let artist = this.parsedArguments.artist as string,
      album = this.parsedArguments.album as string;

    let {
      senderUsername,
      username,
      perspective,
    } = await this.parseMentionedUsername();

    if (!artist || !album) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    }

    let [albumInfo, userInfo, spotifyAlbum] = await Promise.all([
      this.lastFMService.albumInfo({ artist, album, username }),
      this.lastFMService.userInfo({ username }),
      this.spotifyService.searchAlbum(artist, album),
    ]);

    this.tagConsolidator.addTags(albumInfo.tags.tag);

    let linkConsolidator = new LinkConsolidator([
      LinkConsolidator.spotify(spotifyAlbum?.external_urls?.spotify),
      LinkConsolidator.lastfm(albumInfo.url),
    ]);

    let albumDuration = albumInfo.tracks.track.reduce(
      (sum, t) => sum + t.duration.toInt(),
      0
    );

    let embed = new MessageEmbed()
      .setTitle(albumInfo.name.italic() + " by " + albumInfo.artist.bold())
      .addFields(
        {
          name: "Listeners",
          value: numberDisplay(albumInfo.listeners),
          inline: true,
        },
        {
          name: "Playcount",
          value: numberDisplay(albumInfo.playcount),
          inline: true,
        }
      )
      .setURL(albumInfo.url)
      .setImage(
        albumInfo.image.find((i) => i.size === "large")?.["#text"] ||
          (spotifyAlbum &&
            this.spotifyService.getImageFromSearchItem(spotifyAlbum)) ||
          ""
      )
      .setDescription(
        (albumInfo.tracks.track.length
          ? `_${numberDisplay(albumInfo.tracks.track.length, "track")}` +
            ` (${numberDisplay(Math.ceil(albumDuration / 60), "minute")})_\n\n`
          : "") +
          (albumInfo.wiki
            ? this.scrubReadMore(albumInfo.wiki?.summary.trimRight())
            : "") +
          (this.tagConsolidator.hasTags()
            ? (albumInfo.wiki?.summary.length ? "\n\n" : "") +
              "**Tags:** " +
              this.tagConsolidator.consolidate().join(" ‧ ") +
              "\n"
            : "") +
          (linkConsolidator.hasLinks()
            ? `**Links**: ${linkConsolidator.consolidate()}`
            : "")
      )
      .addField(
        `${perspective.upper.possessive} stats`,
        `
        \`${numberDisplay(albumInfo.userplaycount, "` play", true)} by ${
          perspective.objectPronoun
        } (${calculatePercent(
          albumInfo.userplaycount,
          userInfo.playcount,
          4
        ).bold()}% of ${perspective.possessivePronoun} total scrobbles)
        ${perspective.upper.regularVerb("account")} for ${calculatePercent(
          albumInfo.userplaycount,
          albumInfo.playcount
        ).bold()}% of all scrobbles of this album!`
      );

    console.log(
      albumInfo.image.find((i) => i.size === "large")?.["#text"] ||
        (spotifyAlbum &&
          this.spotifyService.getImageFromSearchItem(spotifyAlbum))
    );

    this.send(embed);
  }
}
