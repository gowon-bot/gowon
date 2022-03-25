import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabFlags } from "../../../lib/context/arguments/prefabArguments";
import { CommandRedirect } from "../../../lib/command/Command";
import AlbumPlaysequal from "./AlbumPlaysequal";
import { bold } from "../../../helpers/discord";

const args = {
  plays: new NumberArgument({
    default: 100,
    description: "The number of plays to check for",
  }),
  equal: prefabFlags.equal,
  ...standardMentions,
} as const;

export default class AlbumPlaysover extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan nayoung";

  aliases = ["alpo", "lpo"];
  description = "Shows you how many albums you have over a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => args.equal,
      redirectTo: AlbumPlaysequal,
    },
  ];

  slashCommand = true;

  arguments = args;

  async run() {
    let plays = this.parsedArguments.plays;

    let { requestable, perspective } = await this.getMentions();

    let topAlbums = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    let playsover = 0;

    for (let album of topAlbums.albums) {
      if (album.userPlaycount >= plays) playsover++;
      else break;
    }

    await this.oldReply(
      `${bold(displayNumber(playsover))} of ${
        perspective.possessive
      } top 1,000 albums have at least ${bold(displayNumber(plays, "play"))}`
    );
  }
}
