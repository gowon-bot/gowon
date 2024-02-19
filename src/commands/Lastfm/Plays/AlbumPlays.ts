import { bold, italic } from "../../../helpers/discord";
import { toInt } from "../../../helpers/lastfm/";
import { CommandRedirect } from "../../../lib/command/Command";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import GlobalAlbumPlays from "./GlobalAlbumPlays";

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

    const albumDetails = await this.lastFMService.albumInfo(this.ctx, {
      artist,
      album,
      username: requestable,
    });

    const embed = this.minimalEmbed().setDescription(
      `${perspective.upper.plusToHave}` +
        (toInt(albumDetails.userPlaycount) === 0
          ? "n't scrobbled"
          : ` **${displayNumber(
              albumDetails.userPlaycount,
              "**scrobble"
            )} of`) +
        ` ${italic(albumDetails.name)} by ${bold(albumDetails.artist)}`
    );

    await this.reply(embed);
  }
}
