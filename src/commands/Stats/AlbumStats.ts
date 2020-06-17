import { BaseCommand } from "../../BaseCommand";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../arguments";
import { calculatePercent } from "../../helpers/stats";
import { ucFirst, numberDisplay } from "../../helpers";

export default class ArtistStats extends BaseCommand {
  aliases = ["alstats", "als", "ls"];
  description = "Display some stats about an album";
  arguments: Arguments = {
    inputs: {
      track: { index: 0, splitOn: "|" },
      artist: { index: 1, splitOn: "|" },
    },
    mentions: {
      0: { name: "user", description: "The user to generate stats for" },
    },
  };

  async run(message: Message) {
    let album = this.parsedArguments.album as string,
      artist = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message, false);

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
      .setTitle(albumInfo.name + " _by " + albumInfo.artist + "_")
      .addField(
        "Global stats",
        `\`${numberDisplay(albumInfo.listeners)}\` listeners
\`${numberDisplay(albumInfo.playcount)}\` total plays
\`${numberDisplay(albumInfo.userplaycount)}\` plays by ${perspective.pronoun}
That means ${perspective.regularVerb("account")} for ${calculatePercent(
          albumInfo.userplaycount,
          albumInfo.playcount
        )}% of all scrobbles of this album!`
      )
      .addField(
        `${ucFirst(perspective.possessive)} stats`,
        `${calculatePercent(albumInfo.userplaycount, userInfo.playcount)}% of ${
          perspective.possesivePronoun
        } total scrobbles`
      );

    message.channel.send(embed);
  }
}
