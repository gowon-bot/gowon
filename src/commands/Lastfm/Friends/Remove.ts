import { FriendsChildCommand } from "./FriendsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";

export class Remove extends FriendsChildCommand {
  description = "Remove a friend";

  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to remove",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      friendUsername: { index: 0 },
    },
  };

  async prerun() {}

  async run(message: Message) {
    let { username, senderUsername } = await this.parseMentionedUsername(
      message, { inputArgumentName: "friendUsername" }
    );

    if (username === senderUsername)
      throw new LogicError("Please specify a user to remove as a friend!");

    let user = await this.usersService.getUser(message.author.id, message.guild?.id!);

    await this.friendsService.removeFriend(
      message.guild?.id!,
      user,
      username
    );

    await message.channel.send(
      new MessageEmbed().setDescription(
        `Successfully added ${username.code()} as a friend!`
      )
    );
  }
}
