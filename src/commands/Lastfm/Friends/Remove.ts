import { LogicError } from "../../../errors/errors";
import { code } from "../../../helpers/discord";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { FriendsChildCommand } from "./FriendsChildCommand";

const args = {
  ...standardMentions,
  friendUsername: new StringArgument(),
};

export class Remove extends FriendsChildCommand<typeof args> {
  idSeed = "nature haru";

  aliases = ["removefriend", "removefriends"];
  description = "Removes a friend";
  usage = ["lfm_username", "@user"];

  arguments = args;

  validation: Validation = {
    user: {
      validator: new validators.RequiredValidator({
        message: "please specify a friend to remove!",
      }),
      dependsOn: ["friendUsername", "userID", "lastfmUsername"],
    },
  };

  async beforeRun() {}

  async run() {
    const { username, senderUsername, senderUser, mentionedDBUser } =
      await this.getMentions({
        usernameArgumentKey: "friendUsername",
        senderRequired: true,
      });

    if (username === senderUsername) {
      throw new LogicError("you can't be friends with yourself!");
    }

    await this.friendsService.removeFriend(
      this.ctx,
      senderUser!,
      mentionedDBUser || username
    );

    await this.send(
      this.newEmbed().setDescription(
        `Successfully removed ${code(username)} as a friend!`
      )
    );
  }
}
