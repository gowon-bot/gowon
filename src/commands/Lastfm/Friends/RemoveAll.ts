import { displayNumber } from "../../../lib/views/displays";
import { FriendsChildCommand } from "./FriendsChildCommand";

export class RemoveAll extends FriendsChildCommand {
  idSeed = "nature loha";

  description = "Removes all your friends";
  usage = [""];

  async prerun() {}

  async run() {
    let user = await this.usersService.getUser(this.author.id);

    let deletedCount = await this.friendsService.clearFriends(
      this.guild.id,
      user
    );

    await this.send(
      this.newEmbed().setDescription(
        `Successfully removed ${displayNumber(deletedCount, "friend")}!`
      )
    );
  }
}
