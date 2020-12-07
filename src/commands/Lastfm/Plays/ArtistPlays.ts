import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { RunAs } from "../../../lib/AliasChecker";

export default class ArtistPlays extends LastFMBaseCommand {
  idSeed = "itzy ryujin";
  
  aliases = ["ap", "p", "plays"];
  description = "Shows you how many plays you have of a given artist";
  subcategory = "plays";
  usage = ["", "artist @user"];

  arguments: Arguments = {
    inputs: {
      artist: {
        index: {
          start: 0,
        },
      },
    },
    mentions: standardMentions,
  };

  async run(_: any, runAs: RunAs) {
    let artist = this.parsedArguments.artist as string;

    let { username, senderUsername, perspective } = await this.parseMentions({
      senderRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let artistDetails = await this.lastFMService.artistInfo({
      artist,
      username,
    });

    let prefix = await this.gowonService.prefix(this.guild.id);

    await this.reply(
      `${perspective.plusToHave}` +
        (artistDetails.stats.userplaycount.toInt() === 0
          ? "n't scrobbled"
          : ` **${numberDisplay(
              artistDetails.stats.userplaycount,
              "**scrobble"
            )} of`) +
        ` ${artistDetails.name.strong()}` +
        (runAs.variationWasUsed("ap")
          ? `\n_looking for album plays? That command has moved to \`${prefix}lp\` or \`${prefix}albumplays\`_`
          : "")
    );
  }
}
