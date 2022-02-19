import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { FriendsService } from "../../../services/dbservices/FriendsService";
import { Message } from "discord.js";
import { User } from "../../../database/entity/User";
import { LogicError } from "../../../errors";
import { Requestable } from "../../../services/LastFM/LastFMAPIService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

export abstract class FriendsChildCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseChildCommand<T> {
  parentName = "friends";

  friendsService = ServiceRegistry.get(FriendsService);

  friendUsernames: string[] = [];
  senderRequestable!: Requestable;
  user!: User;

  throwIfNoFriends = false;

  async prerun() {
    let [, senderRequestable] = await Promise.all([
      this.setFriendUsernames(this.message),
      this.usersService.getRequestable(this.ctx, this.author.id),
    ]);
    this.senderRequestable = senderRequestable;

    if (this.throwIfNoFriends && this.friendUsernames.length < 1)
      throw new LogicError("you don't have any friends :(");
  }

  async setFriendUsernames(message: Message) {
    let user = await this.usersService.getUser(this.ctx, message.author.id);

    this.user = user;

    this.friendUsernames = await this.friendsService.getUsernames(
      this.ctx,
      user
    );
  }

  protected displayMissingFriend(username: string, entity = "playcount") {
    return `${username.code()} - _Error fetching ${entity}_`;
  }
}
