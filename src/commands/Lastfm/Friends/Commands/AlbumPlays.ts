import { FriendsChildCommand } from "../FriendsChildCommand";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { numberDisplay } from "../../../../helpers";
import { Arguments } from "../../../../lib/arguments/arguments";
import { LastFMEntityNotFoundError } from "../../../../errors";
import { toInt } from "../../../../helpers/lastFM";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
} as const;

export class AlbumPlays extends FriendsChildCommand<typeof args> {
  idSeed = "elris karin";

  description = "Shows how many plays of an album your friends have";
  aliases = ["lp", "alp"];
  usage = ["", "artist | album"];

  arguments: Arguments = args;

  throwIfNoFriends = true;

  async run() {
    let artist = this.parsedArguments.artist,
      album = this.parsedArguments.album;

    if (!artist || !album) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        this.senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    }

    let albumDetails = await new MultiRequester([
      ...this.friendUsernames,
      this.senderUsername,
    ]).fetch(this.lastFMService.albumInfo.bind(this.lastFMService), {
      artist,
      album,
    });

    let albumInfo = Object.values(albumDetails).filter((v) => v?.name)[0]!;

    if (!albumInfo) throw new LastFMEntityNotFoundError("album");

    let embed = this.newEmbed()
      .setTitle(
        `Your friends plays of ${albumInfo.name} by ${albumInfo.artist}`
      )
      .setDescription(
        Object.keys(albumDetails)
          .sort(
            (a, b) =>
              (toInt(albumDetails[b]?.userplaycount) ?? -Infinity) -
              (toInt(albumDetails[a]?.userplaycount) ?? -Infinity)
          )
          .map((username) => {
            let ad = albumDetails[username];

            if (!ad?.userplaycount) return this.displayMissingFriend(username);

            return `${username.code()} - **${numberDisplay(
              ad.userplaycount,
              "**scrobble"
            )}`;
          })
      );

    await this.send(embed);
  }
}
