import { FriendsChildCommand } from "./FriendsChildCommand";
import { numberDisplay } from "../../../helpers";

export class RemoveAll extends FriendsChildCommand {
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
        `Successfully removed ${numberDisplay(deletedCount, "friend")}!`
      )
    );
  }
}
