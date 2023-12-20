import { displayNumber } from "../../../lib/views/displays";
import { FriendsChildCommand } from "./FriendsChildCommand";

export class RemoveAll extends FriendsChildCommand {
  idSeed = "nature loha";

  aliases = ["clear"];
  description = "Removes all your friends";
  usage = [""];

  async run() {
    const user = await this.usersService.getUser(this.ctx, this.author.id);

    const deletedCount = await this.friendsService.clearFriends(this.ctx, user);

    const embed = this.authorEmbed()
      .setHeader("Friends remove all")
      .setDescription(
        `Successfully removed ${displayNumber(deletedCount, "friend")}!`
      );

    await this.send(embed);
  }
}
