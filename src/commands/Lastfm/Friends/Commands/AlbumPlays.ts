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
  ...prefabArguments.album,
} satisfies ArgumentsMap;

export class AlbumPlays extends FriendsChildCommand<typeof args> {
  idSeed = "elris karin";

  description = "Shows how many plays of an album your friends have";
  aliases = [
    "lp",
    "alp",
    "friendswhoknowsalbum",
    "fwkl",
    "whoknowsalbum",
    "wkl",
  ];
  usage = ["", "artist | album"];

  arguments = args;

  async run() {
    const { senderRequestable, friends } = await this.getMentions({
      fetchFriendsList: true,
      friendsRequired: true,
    });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable
    );

    const albumDetails = await new MultiRequester(
      this.ctx,
      friends.usernames()
    ).fetch(this.lastFMService.albumInfo.bind(this.lastFMService), {
      artist,
      album,
    });

    const albumInfo = Object.values(albumDetails).filter((v) => v?.name)[0]!;

    if (!albumInfo) throw new LastFMEntityNotFoundError("album");

    const friendDisplays = friends
      .sortBy((f) => albumDetails[f.getUsername()]?.userPlaycount ?? -Infinity)
      .map((f) => {
        const ad = albumDetails[f.getUsername()];

        if (!ad || isNaN(ad.userPlaycount)) {
          return this.displayMissingFriend(f.getUsername());
        }

        return `${f.display()} - **${displayNumber(
          ad.userPlaycount,
          "**scrobble"
        )}`;
      });

    const totalPlays = Object.values(albumDetails).reduce(
      (acc, ld) => acc + (ld?.userPlaycount ?? 0),
      0
    );

    const embed = this.authorEmbed()
      .setHeader("Friends album plays")
      .setTitle(
        `Your friends plays of ${albumInfo.name} by ${albumInfo.artist}`
      )
      .setDescription(displayNumberedList(friendDisplays))
      .setFooter(
        `Your friends have a total of ${displayNumber(
          totalPlays,
          "scrobble"
        )} of this album`
      );

    await this.send(embed);
  }
}
