import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { CommandRedirect } from "../../../lib/command/BaseCommand";
import GlobalTrackPlays from "./GlobalTrackPlays";

const args = {
  ...prefabArguments.track,
  global: new Flag({
    longnames: ["global"],
    shortnames: ["g"],
    description: "Compares your plays against the global stats",
  }),
  ...standardMentions,
} as const;

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
    let { requestable, senderRequestable, perspective } =
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

    await this.oldReply(
      `${hamham ? "FTFY\n" : ""}${perspective.plusToHave}` +
        (trackDetails.userPlaycount === 0
          ? "n't scrobbled"
          : ` **${displayNumber(
              trackDetails.userPlaycount,
              "**scrobble"
            )} of`) +
        ` **${trackDetails.name}** by ${trackDetails.artist.name}`
    );
  }
}
