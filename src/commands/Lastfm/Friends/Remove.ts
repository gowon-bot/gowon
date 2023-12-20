import { InvalidFriendUsernameError } from "../../../errors/commands/friends";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { FriendsChildCommand } from "./FriendsChildCommand";

const args = {
  ...standardMentions,
  friendUsername: new StringArgument({
    index: 0,
    description: "The username or alias of the friend to remove",
  }),
};

export class Remove extends FriendsChildCommand<typeof args> {
  idSeed = "nature haru";

  aliases = ["removefriend", "removefriends"];
  description = "Removes a friend";
  usage = ["lfm_username", "@user", "alias"];

  arguments = args;

  validation: Validation = {
    user: {
      validator: new validators.RequiredValidator({
        message: "please specify a friend to remove!",
      }),
      dependsOn: ["friendUsername", "userID", "lastfmUsername"],
    },
  };

  async run() {
    const { username, senderUsername, senderUser, mentionedDBUser } =
      await this.getMentions({
        usernameArgumentKey: "friendUsername",
        senderRequired: true,
      });

    if (username === senderUsername) {
      throw new InvalidFriendUsernameError();
    }

    const friend =
      (await this.friendsService.getFriend(
        this.ctx,
        senderUser!,
        mentionedDBUser || username
      )) ??
      (await this.friendsService.getFriendByAlias(
        senderUser!,
        this.parsedArguments.friendUsername || ""
      ));

    await this.friendsService.removeFriend(this.ctx, friend);

    const embed = this.authorEmbed()
      .setHeader("Friends remove")
      .setDescription(`Successfully removed ${friend?.display()} as a friend!`);

    await this.send(embed);
  }
}
