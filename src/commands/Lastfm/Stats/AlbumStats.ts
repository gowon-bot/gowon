import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { calculatePercent } from "../../../helpers/stats";
import { ucFirst, numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistStats extends LastFMBaseCommand {
  aliases = ["alstats", "als", "ls"];
  description = "Display some stats about an album";
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
    let album = this.parsedArguments.album as string,
      artist = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message, { asCode: false });

    if (!artist || !album) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    }

    let [albumInfo, userInfo] = await Promise.all([
      this.lastFMService.albumInfo(artist, album, username),
      this.lastFMService.userInfo(username),
    ]);

    let embed = new MessageEmbed()
      .setAuthor(`Album stats for ${username}`)
      .setTitle(albumInfo.name + " by " + albumInfo.artist.italic())
      .setImage(
        albumInfo.image.find((i) => i.size === "large")?.["#text"] || ""
      )
      .addField(
        "Global stats",
        `\`${numberDisplay(albumInfo.listeners, "` listener", true)}
\`${numberDisplay(albumInfo.playcount, "` total play", true)}
\`${numberDisplay(albumInfo.userplaycount, "` play", true)} by ${
          perspective.objectPronoun
        }
That means ${perspective.regularVerb("account")} for ${calculatePercent(
          albumInfo.userplaycount,
          albumInfo.playcount
        ).bold()}% of all scrobbles of this album!`
      )
      .addField(
        `${ucFirst(perspective.possessive)} stats`,
        `${calculatePercent(
          albumInfo.userplaycount,
          userInfo.playcount,
          4
        ).bold()}% of ${perspective.possesivePronoun} total scrobbles`
      );
    message.channel.send(embed);
  }
}
