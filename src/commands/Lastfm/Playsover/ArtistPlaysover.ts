import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { CommandRedirect } from "../../../lib/command/BaseCommand";
import ArtistPlaysequal from "./ArtistPlaysequal";
import { prefabFlags } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  equal: prefabFlags.equal,
  plays: new NumberArgument({
    default: 100,
    description: "The number of plays to check for",
  }),
} as const;

export default class ArtistPlaysover extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan sally";

  aliases = ["po", "apo"];
  description = "Shows you how many artists you have over a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => args.equal,
      redirectTo: ArtistPlaysequal,
    },
  ];

  slashCommand = true;

  arguments = args;

  async run() {
    let plays = this.parsedArguments.plays;

    let { requestable, perspective } = await this.getMentions();

    let topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    let playsover = 0;

    for (let artist of topArtists.artists) {
      if (artist.userPlaycount >= plays) playsover++;
      else break;
    }

    await this.oldReply(
      `${displayNumber(playsover).strong()} of ${
        perspective.possessive
      } top 1,000 artists have at least ${displayNumber(
        plays,
        "play"
      ).strong()}`
    );
  }
}
