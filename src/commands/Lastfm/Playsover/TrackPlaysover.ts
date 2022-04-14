import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { prefabFlags } from "../../../lib/context/arguments/prefabArguments";
import { CommandRedirect } from "../../../lib/command/Command";
import TrackPlaysequal from "./TrackPlaysequal";
import { bold } from "../../../helpers/discord";

const args = {
  plays: new NumberArgument({
    default: 100,
    description: "The number of plays to check for",
  }),
  equal: prefabFlags.equal,
  ...standardMentions,
} as const;

export default class TrackPlaysover extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan mina";

  aliases = ["trpo", "tpo"];
  description = "Shows you how many tracks you have over a certain playcount";
  subcategory = "playsover";
  usage = ["", "number"];

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => args.equal,
      redirectTo: TrackPlaysequal,
    },
  ];

  slashCommand = true;

  arguments = args;

  async run() {
    let plays = this.parsedArguments.plays;

    let { requestable, perspective } = await this.getMentions();

    let topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    let playsover = 0;

    for (let track of topTracks.tracks) {
      if (track.userPlaycount >= plays) playsover++;
      else break;
    }

    await this.oldReply(
      `${bold(displayNumber(playsover))} of ${
        perspective.possessive
      } top 1,000 tracks have at least ${bold(displayNumber(plays, "play"))}`
    );
  }
}
