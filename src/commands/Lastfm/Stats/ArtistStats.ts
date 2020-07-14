import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { calculatePercent } from "../../../helpers/stats";
import { ucFirst, numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistStats extends LastFMBaseCommand {
  aliases = ["astats", "as"];
  description = "Display some stats about an artist";
  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
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
    let artistName = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message, { asCode: false });

    if (!artistName) {
      artistName = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let [artist, userInfo] = await Promise.all([
      this.lastFMService.artistInfo(artistName, username),
      this.lastFMService.userInfo(username),
    ]);

    let embed = new MessageEmbed()
      .setAuthor(`Artist stats for ${username}`)
      .setTitle(artist.name)
      .addField(
        "Global stats",
        `\`${numberDisplay(artist.stats.listeners, "` listener", true)}
\`${numberDisplay(artist.stats.playcount, "` total play", true)}
\`${numberDisplay(artist.stats.userplaycount, "` play", true)} by ${
          perspective.objectPronoun
        }
That means ${perspective.regularVerb("account")} for ${calculatePercent(
          artist.stats.userplaycount,
          artist.stats.playcount,
          4
        ).bold()}% of all ${artist.name} scrobbles!`
      )
      .addField(
        `${ucFirst(perspective.possessive)} stats`,
        `${calculatePercent(
          artist.stats.userplaycount,
          userInfo.playcount
        ).bold()}% of ${perspective.possesivePronoun} total scrobbles`
      );

    message.channel.send(embed);
  }
}
