import { LastFMEntityNotFoundError } from "../../../../errors/errors";
import { code } from "../../../../helpers/discord";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { displayNumber } from "../../../../lib/views/displays";
import { FriendsChildCommand } from "../FriendsChildCommand";

const args = {
  ...prefabArguments.track,
} satisfies ArgumentsMap;

export class TrackPlays extends FriendsChildCommand<typeof args> {
  idSeed = "nature saebom";

  description = "Shows how many plays of a track your friends have";
  aliases = ["tp", "friendswhoknowstrack", "fwkt", "whoknowstrack", "wkt"];
  usage = ["", "artist | track"];

  arguments = args;

  throwIfNoFriends = true;

  async run() {
    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      this.senderRequestable
    );

    const trackDetails = await new MultiRequester(this.ctx, [
      ...this.friendUsernames,
      this.senderRequestable,
    ]).fetch(this.lastFMService.trackInfo.bind(this.lastFMService), {
      artist,
      track,
    });

    const trackInfo = Object.values(trackDetails).filter((v) => v?.name)[0]!;

    if (!trackInfo) throw new LastFMEntityNotFoundError("track");

    const embed = this.newEmbed()
      .setTitle(
        `Your friends plays of ${trackInfo.name} by ${trackInfo.artist.name}`
      )
      .setDescription(
        Object.keys(trackDetails)
          .sort(
            (a, b) =>
              (trackDetails[b]?.userPlaycount ?? -Infinity) -
              (trackDetails[a]?.userPlaycount ?? -Infinity)
          )
          .map((username) => {
            const td = trackDetails[username];

            if (!td || isNaN(td.userPlaycount)) {
              return this.displayMissingFriend(username);
            }

            return `${code(username)} - **${displayNumber(
              td.userPlaycount,
              "**scrobble"
            )}`;
          })
          .join("\n")
      );

    await this.send(embed);
  }
}
