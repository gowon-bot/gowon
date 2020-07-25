import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { FriendsService } from "../../../services/dbservices/FriendsService";
import { Message } from "discord.js";
import { User } from "../../../database/entity/User";

export abstract class FriendsChildCommand extends LastFMBaseChildCommand {
  parentName = "friends";

  friendsService = new FriendsService(this.logger);

  friendUsernames: string[] = [];
  senderUsername!: string;
  user!: User;

  async prerun(message: Message) {
    let [, senderUsername] = await Promise.all([
      this.setFriendUsernames(message),
      this.usersService.getUsername(message.author.id, message.guild?.id!),
    ]);
    this.senderUsername = senderUsername;
  }

  async setFriendUsernames(message: Message) {
    let user = await this.usersService.getUser(message.author.id, message.guild?.id!);

    this.user = user;

    this.friendUsernames = await this.friendsService.getUsernames(
      message.guild?.id!,
      user
    );
  }
}
