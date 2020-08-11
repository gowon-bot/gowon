import { FriendsChildCommand } from "./FriendsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";

export class Add extends FriendsChildCommand {
  description = "Add a friend";
  usage = ["lfm_username", "@user"];

  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to add",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      friendUsername: { index: 0 },
    },
  };

  async prerun() {}

  async run(message: Message) {
    let {
      username,
      senderUsername,
    } = await this.parseMentionedUsername(message, {
      inputArgumentName: "friendUsername",
    });

    if (username === senderUsername)
      throw new LogicError("Please specify a user to add as a friend!");

    let user = await this.usersService.getUser(
      message.author.id,
      message.guild?.id!
    );

    let friend = await this.friendsService.addFriend(
      message.guild?.id!,
      user,
      username
    );

    await message.channel.send(
      new MessageEmbed().setDescription(
        `Successfully added ${friend.friendUsername.code()} as a friend!`
      )
    );
  }
}
