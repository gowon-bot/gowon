import { CommandRedirect } from "../../../lib/command/Command";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import GlobalTrackPlays from "./GlobalTrackPlays";

const args = {
  ...prefabArguments.track,
  global: new Flag({
    longnames: ["global"],
    shortnames: ["g"],
    description: "Compares your plays against the global stats",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class TrackPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan hana";

  aliases = ["tp"];
  description = "Shows how many plays a user has of a given track";
  subcategory = "plays";
  usage = ["artist | track @user"];

  slashCommand = true;

  redirects: CommandRedirect<typeof args>[] = [
    { when: (args) => args.global, redirectTo: GlobalTrackPlays },
  ];

  arguments = args;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
      });

    let { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable
    );

    const hamham =
      artist.toLowerCase() === "iu" && track.toLowerCase() === "ham ham";
    if (hamham) track = "Jam Jam";

    const trackDetails = await this.lastFMService.trackInfo(this.ctx, {
      artist,
      track,
      username: requestable,
    });

    const embed = this.minimalEmbed().setDescription(
      `${hamham ? "FTFY\n" : ""}${perspective.upper.plusToHave}` +
        (trackDetails.userPlaycount === 0
          ? "n't scrobbled"
          : ` **${displayNumber(
              trackDetails.userPlaycount,
              "**scrobble"
            )} of`) +
        ` **${trackDetails.name}** by ${trackDetails.artist.name}`
    );

    await this.reply(embed);
  }
}
