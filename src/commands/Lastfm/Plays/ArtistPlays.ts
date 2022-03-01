import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { CommandRedirect } from "../../../lib/command/BaseCommand";
import GlobalArtistPlays from "./GlobalArtistPlays";

const args = {
  ...prefabArguments.artist,
  global: new Flag({
    longnames: ["global"],
    shortnames: ["g"],
    description: "Compares your plays against the global stats",
  }),
  ...standardMentions,
} as const;

export default class ArtistPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy ryujin";

  aliases = ["ap", "p", "plays"];
  description = "Shows how many plays a user has of a given artist";
  subcategory = "plays";
  usage = ["", "artist @user"];

  arguments = args;
  slashCommand = true;

  redirects: CommandRedirect<typeof args>[] = [
    { when: (args) => args.global, redirectTo: GlobalArtistPlays },
  ];

  async run() {
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
        (this.runAs.variationWasUsed("ap")
          ? `\n_looking for album plays? That command has moved to \`${prefix}lp\` or \`${prefix}albumplays\`_`
          : "")
    );
  }
}
