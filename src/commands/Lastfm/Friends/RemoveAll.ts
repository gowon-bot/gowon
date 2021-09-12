import { displayNumber } from "../../../lib/views/displays";
import { FriendsChildCommand } from "./FriendsChildCommand";

export class RemoveAll extends FriendsChildCommand {
  idSeed = "nature loha";

  description = "Removes all your friends";
  usage = [""];

  async prerun() {}

  async run() {
    const user = await this.usersService.getUser(this.ctx, this.author.id);

    const deletedCount = await this.friendsService.clearFriends(this.ctx, user);

    await this.send(
      this.newEmbed().setDescription(
        `Successfully removed ${displayNumber(deletedCount, "friend")}!`
      )
    );
  }
}
