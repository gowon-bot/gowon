import { FriendsChildCommand } from "./FriendsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { FriendsRequester } from "../../../lib/FriendsRequester";
import { numberDisplay } from "../../../helpers";
import { LogicError } from "../../../errors";

export class List extends FriendsChildCommand {
  aliases = ["fm", "np", "nowplaying"];
  description = "View what your friends are listening to";
  usage = "";

  async run(message: Message) {
    let nowPlayings = await new FriendsRequester(this.friendUsernames).fetch(
      this.lastFMService.nowPlayingParsed.bind(this.lastFMService),
      []
    );

    let numberOfFriends = await this.friendsService.friendsCount(
      message.guild?.id!,
      this.user
    );

    if (numberOfFriends === 0)
      throw new LogicError("you don't have any friends :(");

    let embed = new MessageEmbed()
      .setTitle(
        `${numberDisplay(numberOfFriends, "friend")} for ${
          message.author.username
        }`
      )
      .setDescription(
        Object.keys(nowPlayings).map((username) => {
          let np = nowPlayings[username];

          return `${username.code()} - ${
            np.name
          } by ${np.artist.bold()} from ${np.album.italic()}`;
        })
      );

    await this.send(embed);
  }
}
