import { FriendsChildCommand } from "../FriendsChildCommand";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { numberDisplay } from "../../../../helpers";
import { Arguments } from "../../../../lib/arguments/arguments";
import { FriendNotFoundError } from "../../../../errors";

export class AlbumPlays extends FriendsChildCommand {
  description = "View how many plays of an album your friends have";
  aliases = ["lp", "alp"];
  usage = ["", "artist | album"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
    },
  };

  throwIfNoFriends = true;

  async run() {
    let artist = this.parsedArguments.artist as string,
      album = this.parsedArguments.album as string;

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
    ])
      .fetch(this.lastFMService.albumInfo.bind(this.lastFMService), {
        artist,
        album,
      })
      .catch(() => {
        throw new FriendNotFoundError();
      });

    let albumInfo = Object.values(albumDetails).filter((v) => v.name)[0];

    let embed = this.newEmbed()
      .setTitle(
        `Your friends plays of ${albumInfo.name} by ${albumInfo.artist}`
      )
      .setDescription(
        Object.keys(albumDetails)
          .sort(
            (a, b) =>
              albumDetails[b].userplaycount.toInt() -
              albumDetails[a].userplaycount.toInt()
          )
          .map((username) => {
            let ad = albumDetails[username];

            return `${username.code()} - **${numberDisplay(
              ad.userplaycount,
              "**scrobble"
            )} of **${ad.name}**`;
          })
      );

    await this.send(embed);
  }
}
