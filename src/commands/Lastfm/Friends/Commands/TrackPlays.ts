import { LastFMEntityNotFoundError } from "../../../../errors/errors";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import {
  displayNumber,
  displayNumberedList,
} from "../../../../lib/ui/displays";
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

  async run() {
    const { senderRequestable, friends } = await this.getMentions({
      friendsRequired: true,
      fetchFriendsList: true,
    });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable
    );

    const trackDetails = await new MultiRequester(
      this.ctx,
      friends.usernames()
    ).fetch(this.lastFMService.trackInfo.bind(this.lastFMService), {
      artist,
      track,
    });

    const trackInfo = Object.values(trackDetails).filter((v) => v?.name)[0]!;

    if (!trackInfo) {
      throw new LastFMEntityNotFoundError("track");
    }

    const friendDisplays = friends
      .sortBy((f) => trackDetails[f.getUsername()]?.userPlaycount ?? -Infinity)
      .map((f) => {
        const td = trackDetails[f.getUsername()];

        if (!td || isNaN(td.userPlaycount)) {
          return this.displayMissingFriend(f.getUsername());
        }

        return `${f.display()} - **${displayNumber(
          td.userPlaycount,
          "**scrobble"
        )}`;
      });

    const totalPlays = Object.values(trackDetails).reduce(
      (acc, td) => acc + (td?.userPlaycount ?? 0),
      0
    );

    const embed = this.minimalEmbed()
      .setTitle(
        `Your friends plays of ${trackInfo.name} by ${trackInfo.artist.name}`
      )
      .setDescription(displayNumberedList(friendDisplays))
      .setFooter(
        `Your friends have a total of ${displayNumber(
          totalPlays,
          "scrobble"
        )} of this track`
      );

    await this.reply(embed);
  }
}
