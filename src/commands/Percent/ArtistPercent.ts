import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay } from "../../helpers";
import { calculatePercent } from "../../helpers/stats";

export default class ArtistPercent extends BaseCommand {
  aliases = ["apct"];
  description =
    "Shows you the percentage of your total scrobbles an artist makes up";
  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
    mentions: {
      0: { name: "user", description: "the user to lookup" },
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
      )} of **${artistInfo.name}** make **${calculatePercent(
        artistInfo.stats.userplaycount,
        userInfo.playcount
      )}%** of ${perspective.possesivePronoun} total scrobbles`
    );
  }
}
