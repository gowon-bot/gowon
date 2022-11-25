import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { CommandRedirect } from "../../../lib/command/Command";
import GlobalAlbumPlays from "./GlobalAlbumPlays";
import { bold, italic } from "../../../helpers/discord";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

const args = {
  ...prefabArguments.album,
  global: new Flag({
    longnames: ["global"],
    shortnames: ["g"],
    description: "Compares your plays against the global stats",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class AlbumPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy lia";

  aliases = ["alp", "lp"];
  description = "Shows how many plays a user has of a given album";
  subcategory = "plays";
  usage = ["", "artist | album @user"];

  redirects: CommandRedirect<typeof args>[] = [
    { when: (args) => args.global, redirectTo: GlobalAlbumPlays },
  ];

  arguments = args;
  slashCommand = true;

  async run() {
    const { senderRequestable, requestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable
    );

    let albumDetails = await this.lastFMService.albumInfo(this.ctx, {
      artist,
      album,
      username: requestable,
    });

    await this.oldReply(
      `${perspective.plusToHave}` +
      (toInt(albumDetails.userPlaycount) === 0
        ? "n't scrobbled"
        : ` **${displayNumber(
          albumDetails.userPlaycount,
          "**scrobble"
        )} of`) +
      ` ${italic(albumDetails.name)} by ${bold(albumDetails.artist)}`
    );
  }
}
