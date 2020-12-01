import { FriendsChildCommand } from "./FriendsChildCommand";
import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError, AlreadyFriendsError } from "../../../errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export class Add extends FriendsChildCommand {
  description = "Adds a friend";
  usage = ["lfm_username", "@user"];

  arguments: Arguments = {
    inputs: {
      friendUsername: { index: 0 },
    },
    mentions: standardMentions,
  };

  validation: Validation = {
    user: {
      validator: new validators.Required({
        message: "please specify a friend to add!",
      }),
      dependsOn: ["friendUsername", "userID", "lfmUser"],
    },
  };

  async prerun() {}

  async run(message: Message) {
    let { username, senderUsername, dbUser } = await this.parseMentions({
      inputArgumentName: "friendUsername",
    });

    if (username === senderUsername)
      throw new LogicError("you can't add yourself as a friend!");

    let user = await this.usersService.getUser(message.author.id);

    let friends = await this.friendsService.getUsernames(
      message.guild?.id!,
      dbUser!
    );

    if (friends.includes(username.toLowerCase()))
      throw new AlreadyFriendsError();

    let friend = await this.friendsService.addFriend(
      message.guild?.id!,
      user,
      username
    );

    await this.send(
      this.newEmbed().setDescription(
        `Successfully added ${friend.friendUsername.code()} as a friend!`
      )
    );
  }
}
