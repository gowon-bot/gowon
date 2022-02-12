import { FriendsChildCommand } from "./FriendsChildCommand";
import { Message } from "discord.js";
import { MultiRequester } from "../../../lib/MultiRequester";
import { displayNumber } from "../../../lib/views/displays";

export class List extends FriendsChildCommand {
  idSeed = "nature chaebin";

  aliases = ["fm", "np", "nowplaying"];
  description = "Shows what your friends are listening to";
  usage = "";

  throwIfNoFriends = true;

  async run(message: Message) {
    let nowPlayings = await new MultiRequester(
      this.ctx,
      this.friendUsernames
    ).fetch(this.lastFMService.nowPlaying.bind(this.lastFMService), []);

    let numberOfFriends = await this.friendsService.friendsCount(
      this.ctx,
      this.user
    );

    let embed = this.newEmbed()
      .setTitle(
        `${displayNumber(numberOfFriends, "friend")} for ${
          message.author.username
        }`
      )
      .setDescription(
        Object.keys(nowPlayings)
          .sort((a, b) => b.localeCompare(a))
          .reverse()
          .map((username) => {
            let np = nowPlayings[username];

            if (!np || !np?.name)
              return this.displayMissingFriend(username, "current track");

            return `${username.code()} - ${np.name} by ${np.artist.strong()} ${
              np.album ? `from ${np.album.italic()}` : ""
            }`;
          })
          .join("\n")
      );

    await this.send(embed);
  }
}
