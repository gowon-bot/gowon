import { NoScrobblesOfTrackError } from "../../../errors/commands/library";
import { CommandRequiresResyncError } from "../../../errors/user";
import { bold, italic } from "../../../helpers/discord";
import { convertLilacDate } from "../../../helpers/lilac";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { Variation } from "../../../lib/command/Command";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { displayDate } from "../../../lib/ui/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacTracksService } from "../../../services/lilac/LilacTracksService";

const args = {
  ...prefabArguments.track,
} satisfies ArgumentsMap;

export default class LastScrobbledTrack extends LilacBaseCommand<typeof args> {
  idSeed = "shasha hwi a";

  aliases = ["lastt", "lasttrack", "lt"];
  variations: Variation[] = [
    { name: "first", variation: ["firstt", "ft", "firsttrack"] },
  ];

  subcategory = "library";
  description = "Shows the last time you scrobbled a track";

  arguments = args;

  lilacTracksService = ServiceRegistry.get(LilacTracksService);

  async run() {
    const { senderRequestable, dbUser, perspective } = await this.getMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.track,
      reverseLookup: { required: true },
      syncedRequired: true,
    });

    const { artist: artistName, track: trackName } =
      await this.lastFMArguments.getTrack(this.ctx, senderRequestable, {
        redirect: true,
      });

    const trackCount = await this.lilacTracksService.getAmbiguousCount(
      this.ctx,
      dbUser.discordID,
      artistName,
      trackName
    );

    if (!trackCount) {
      throw new NoScrobblesOfTrackError(perspective, artistName, trackName);
    } else if (!trackCount.lastScrobbled || !trackCount.firstScrobbled) {
      throw new CommandRequiresResyncError(this.prefix);
    }

    const embed = this.minimalEmbed().setDescription(
      `${Emoji.usesIndexedDataDescription} ${perspective.upper.name} ${
        this.variationWasUsed("first") ? "first" : "last"
      } scrobbled ${italic(trackCount.track.name)} by ${bold(
        trackCount.track.artist.name
      )} on ${displayDate(
        convertLilacDate(
          this.variationWasUsed("first")
            ? trackCount.firstScrobbled
            : trackCount.lastScrobbled
        )
      )}`
    );

    await this.reply(embed);
  }
}
