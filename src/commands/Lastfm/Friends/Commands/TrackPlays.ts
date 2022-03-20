import { FriendsChildCommand } from "../FriendsChildCommand";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { LastFMEntityNotFoundError } from "../../../../errors/errors";
import { displayNumber } from "../../../../lib/views/displays";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { code } from "../../../../helpers/discord";

const args = {
  ...prefabArguments.track,
} as const;

export class TrackPlays extends FriendsChildCommand<typeof args> {
  idSeed = "nature saebom";

  description = "Shows how many plays of a track your friends have";
  aliases = ["tp"];
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
