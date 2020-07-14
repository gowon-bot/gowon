import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class ArtistPercent extends LastFMBaseCommand {
  aliases = ["apct"];
  description =
    "Shows you the percentage of your total scrobbles an artist makes up";
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
    let artist = this.parsedArguments.artist as string;

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!artist)
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;

    let [artistInfo, userInfo] = await Promise.all([
      this.lastFMService.artistInfo(artist, username),
      this.lastFMService.userInfo(username),
    ]);

    await message.reply(
      `${perspective.possessive} ${numberDisplay(
        artistInfo.stats.userplaycount,
        "play"
      )} of ${artistInfo.name.bold()} make ${calculatePercent(
        artistInfo.stats.userplaycount,
        userInfo.playcount
      ).code()}% of ${perspective.possesivePronoun} total scrobbles`
    );
  }
}
