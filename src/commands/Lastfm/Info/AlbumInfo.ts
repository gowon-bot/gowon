import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay, ucFirst } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";

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

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string,
      album = this.parsedArguments.album as string;

    let {
      senderUsername,
      username,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!artist || !album) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    }

    let [albumInfo, userInfo] = await Promise.all([
      this.lastFMService.albumInfo({ artist, album, username }),
      this.lastFMService.userInfo({ username }),
    ]);

    this.tagConsolidator.addTags(albumInfo.tags.tag);

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
        albumInfo.image.find((i) => i.size === "large")?.["#text"] || ""
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
              this.tagConsolidator.consolidate().join(" ‧ ")
            : "")
      )
      .addField(
        `${ucFirst(perspective.possessive)} stats`,
        `
        \`${numberDisplay(albumInfo.userplaycount, "` play", true)} by ${
          perspective.objectPronoun
        } (${calculatePercent(
          albumInfo.userplaycount,
          userInfo.playcount,
          4
        ).bold()}% of ${perspective.possesivePronoun} total scrobbles)
        ${ucFirst(perspective.regularVerb("account"))} for ${calculatePercent(
          albumInfo.userplaycount,
          albumInfo.playcount
        ).bold()}% of all scrobbles of this album!`
      );

    message.channel.send(embed);
  }
}
