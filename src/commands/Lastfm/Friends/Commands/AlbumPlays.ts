import { FriendsChildCommand } from "../FriendsChildCommand";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { LastFMEntityNotFoundError } from "../../../../errors/errors";
import { displayNumber } from "../../../../lib/views/displays";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { code } from "../../../../helpers/discord";

const args = {
  ...prefabArguments.album,
} as const;

export class AlbumPlays extends FriendsChildCommand<typeof args> {
  idSeed = "elris karin";

  description = "Shows how many plays of an album your friends have";
  aliases = ["lp", "alp"];
  usage = ["", "artist | album"];

  arguments = args;

  throwIfNoFriends = true;

  async run() {
    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      this.senderRequestable
    );

    const albumDetails = await new MultiRequester(this.ctx, [
      ...this.friendUsernames,
      this.senderRequestable,
    ]).fetch(this.lastFMService.albumInfo.bind(this.lastFMService), {
      artist,
      album,
    });

    const albumInfo = Object.values(albumDetails).filter((v) => v?.name)[0]!;

    if (!albumInfo) throw new LastFMEntityNotFoundError("album");

    const embed = this.newEmbed()
      .setTitle(
        `Your friends plays of ${albumInfo.name} by ${albumInfo.artist}`
      )
      .setDescription(
        Object.keys(albumDetails)
          .sort(
            (a, b) =>
              (albumDetails[b]?.userPlaycount ?? -Infinity) -
              (albumDetails[a]?.userPlaycount ?? -Infinity)
          )
          .map((username) => {
            const ad = albumDetails[username];

            if (!ad || isNaN(ad.userPlaycount)) {
              return this.displayMissingFriend(username);
            }

            return `${code(username)} - **${displayNumber(
              ad.userPlaycount,
              "**scrobble"
            )}`;
          })
          .join("\n")
      );

    await this.send(embed);
  }
}
