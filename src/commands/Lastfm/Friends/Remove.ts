import { FriendsChildCommand } from "./FriendsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    friendUsername: { index: 0 },
  },
  mentions: standardMentions,
};

export class Remove extends FriendsChildCommand<typeof args> {
  idSeed = "nature haru";

  description = "Removes a friend";
  usage = ["lfm_username", "@user"];

  arguments: Arguments = args;

  validation: Validation = {
    user: {
      validator: new validators.Required({
        message: "please specify a friend to remove!",
      }),
      dependsOn: ["friendUsername", "userID", "lfmUser"],
    },
  };

  async prerun() {}

  async run() {
    const { username, senderUsername, senderUser, mentionedDBUser } =
      await this.parseMentions({
        inputArgumentName: "friendUsername",
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
        `Successfully removed ${username.code()} as a friend!`
      )
    );
  }
}
