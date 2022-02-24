import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { RunAs } from "../../../lib/command/RunAs";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  ...prefabArguments.artist,
} as const;

export default class ArtistPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy ryujin";

  aliases = ["ap", "p", "plays"];
  description = "Shows you how many plays you have of a given artist";
  subcategory = "plays";
  usage = ["", "artist @user"];

  arguments = args;

  async run(_: any, runAs: RunAs) {
    const { perspective, senderRequestable, requestable } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const artistDetails = await this.lastFMService.artistInfo(this.ctx, {
      artist,
      username: requestable,
    });

    const prefix = this.prefix;

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
