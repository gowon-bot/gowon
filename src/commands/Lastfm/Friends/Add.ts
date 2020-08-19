import { FriendsChildCommand } from "./FriendsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError, AlreadyFriendsError } from "../../../errors";

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
      dbUser,
    } = await this.parseMentionedUsername(message, {
      inputArgumentName: "friendUsername",
    });

    if (username === senderUsername)
      throw new LogicError("please specify a user to add as a friend!");

    let user = await this.usersService.getUser(
      message.author.id,
      message.guild?.id!
    );

    let friends = await this.friendsService.getUsernames(
      message.guild?.id!,
      dbUser!
    );

    this.logger.log("friends", friends);

    if (friends.includes(username.toLowerCase()))
      throw new AlreadyFriendsError();

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
