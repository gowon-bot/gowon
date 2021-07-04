import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { RunAs } from "../../../lib/command/RunAs";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    artist: {
      index: 0,
      splitOn: "|",
    },
  },
  mentions: standardMentions,
} as const;

export default class ArtistPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy ryujin";

  aliases = ["ap", "p", "plays"];
  description = "Shows you how many plays you have of a given artist";
  subcategory = "plays";
  usage = ["", "artist @user"];

  arguments: Arguments = args;

  async run(_: any, runAs: RunAs) {
    let { perspective, senderRequestable, requestable } =
      await this.parseMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artist = await this.lastFMArguments.getArtist(senderRequestable);

    const artistDetails = await this.lastFMService.artistInfo({
      artist,
      username: requestable,
    });

    let prefix = this.prefix;

    await this.traditionalReply(
      `${perspective.plusToHave}` +
        (artistDetails.userPlaycount === 0
          ? "n't scrobbled"
          : ` **${displayNumber(
              artistDetails.userPlaycount,
              "**scrobble"
            )} of`) +
        ` ${artistDetails.name.strong()}` +
        (runAs.variationWasUsed("ap")
          ? `\n_looking for album plays? That command has moved to \`${prefix}lp\` or \`${prefix}albumplays\`_`
          : "")
    );
  }
}
