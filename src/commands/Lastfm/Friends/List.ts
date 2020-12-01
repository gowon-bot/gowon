import { FriendsChildCommand } from "./FriendsChildCommand";
import { Message } from "discord.js";
import { MultiRequester } from "../../../lib/MultiRequester";
import { numberDisplay } from "../../../helpers";
import { FriendNotFoundError } from "../../../errors";

export class List extends FriendsChildCommand {
  aliases = ["fm", "np", "nowplaying"];
  description = "Shows what your friends are listening to";
  usage = "";

  throwIfNoFriends = true;

  async run(message: Message) {
    let nowPlayings = await new MultiRequester(this.friendUsernames)
      .fetch(this.lastFMService.nowPlayingParsed.bind(this.lastFMService), [])
      .catch(() => {
        throw new FriendNotFoundError();
      });

    let numberOfFriends = await this.friendsService.friendsCount(
      message.guild?.id!,
      this.user
    );

    let embed = this.newEmbed()
      .setTitle(
        `${numberDisplay(numberOfFriends, "friend")} for ${
          message.author.username
        }`
      )
      .setDescription(
        Object.keys(nowPlayings).map((username) => {
          let np = nowPlayings[username];

          return `${username.code()} - ${np.name} by ${np.artist.strong()} ${
            np.album ? `from ${np.album.italic()}` : ""
          }`;
        })
      );

    await this.send(embed);
  }
}
