import {
  AliasRequiredError,
  InvalidFriendUsernameError,
  NotFriendsError,
} from "../../../errors/commands/friends";
import { code } from "../../../helpers/discord";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { FriendsChildCommand } from "./FriendsChildCommand";

const args = {
  ...standardMentions,
  friendUsername: new StringArgument({
    index: 0,
    description: "The friend to add an alias for",
  }),
  alias: new StringArgument({
    index: 1,
    description: "The alias to use for that friend",
  }),
};

export class Alias extends FriendsChildCommand<typeof args> {
  idSeed = "csr sua";

  aliases = ["nickname", "setalias", "setnickname"];
  description = "Sets an alias for a friend";
  usage = ["lfm_username alias", "@user alias"];

  arguments = args;

  async run() {
    const { senderUser, mentionedDBUser } = await this.getMentions({
      senderRequired: true,
    });

    const alias =
      this.parsedArguments.alias || this.parsedArguments.friendUsername;
    const friendUsername = this.parsedArguments.friendUsername;

    if (!alias) {
      throw new AliasRequiredError();
    }

    if (!(friendUsername || mentionedDBUser)) {
      throw new InvalidFriendUsernameError();
    }

    const friend = await this.friendsService.getFriend(
      this.ctx,
      senderUser!,
      (mentionedDBUser || friendUsername)!
    );

    if (!friend || alias === friend.friendUsername) {
      throw new NotFriendsError();
    }

    const aliasedFriend = await this.friendsService.aliasFriend(
      this.ctx,
      friend,
      alias!
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Friend alias"))
      .setDescription(
        `Aliased ${code(aliasedFriend.getUsername())} as ${alias}!`
      );

    await this.send(embed);
  }
}
