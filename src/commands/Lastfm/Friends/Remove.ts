import { FriendsChildCommand } from "./FriendsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

export class Remove extends FriendsChildCommand {
  description = "Remove a friend";
  usage = ["lfm_username", "@user"];

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

  validation: Validation = {
    user: {
      validator: new validators.Required({
        message: "please specify a friend to remove!",
      }),
      dependsOn: ["friendUsername"],
    },
  };

  async prerun() {}

  async run(message: Message) {
    let { username, senderUsername } = await this.parseMentionedUsername({
      inputArgumentName: "friendUsername",
    });

    if (username === senderUsername)
      throw new LogicError("you can't be friends with yourself!");

    let user = await this.usersService.getUser(message.author.id);

    await this.friendsService.removeFriend(message.guild?.id!, user, username);

    await this.send(
      new MessageEmbed().setDescription(
        `Successfully removed ${username.code()} as a friend!`
      )
    );
  }
}
