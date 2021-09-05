import { Friend } from "../../database/entity/Friend";
import {
  AlreadyFriendsError,
  NotFriendsError,
  LastFMUserDoesntExistError,
  TooManyFriendsError,
} from "../../errors";
import { BaseService } from "../BaseService";
import { User } from "../../database/entity/User";
import { LastFMService } from "../LastFM/LastFMService";
import { ILike } from "typeorm";

export class FriendsService extends BaseService {
  private lastFMService = new LastFMService(this.logger);
  private friendsLimit = 10;
  private patronFriendsLimit = 15;

  async addFriend(
    user: User,
    friendToAdd: string | User,
    prefix: string
  ): Promise<Friend> {
    this.log(`Adding friend ${friendToAdd} for user ${user.lastFMUsername}`);

    if (
      (await this.friendsCount(user)) >=
      (user.isPatron ? this.patronFriendsLimit : this.friendsLimit)
    ) {
      throw new TooManyFriendsError(
        user.isPatron ? this.patronFriendsLimit : this.friendsLimit,
        prefix,
        !user.isPatron
      );
    }

    let friend: Friend | undefined;

    if (friendToAdd instanceof User) {
      friend = await Friend.findOne({ user, friend: friendToAdd });
    } else {
      if (!(await this.lastFMService.userExists(friendToAdd))) {
        throw new LastFMUserDoesntExistError();
      }

      friend = await Friend.findOne({ user, friendUsername: friendToAdd });
    }

    if (friend) throw new AlreadyFriendsError();

    friend = Friend.create({ user });

    if (friendToAdd instanceof User) {
      friend.friend = friendToAdd;
    } else {
      friend.friendUsername = friendToAdd;
    }

    await friend.save();
    return friend;
  }

  async removeFriend(user: User, friendToRemove: string | User): Promise<void> {
    this.log(
      `Removing friend ${friendToRemove} for user ${user.lastFMUsername}`
    );

    let where: any;

    if (friendToRemove instanceof User) {
      where = [
        {
          user,
          friend: friendToRemove,
        },
        {
          user,
          friendUsername: ILike(friendToRemove.lastFMUsername),
        },
      ];
    } else {
      where = {
        friendUsername: ILike(friendToRemove),
      };
    }

    const friend = await Friend.findOne({
      where,
    });

    if (!friend) throw new NotFriendsError();

    await friend.remove();
  }

  async clearFriends(user: User): Promise<number> {
    this.log(`Removing friend all friends for user ${user.lastFMUsername}`);

    let friendsDeleted = await Friend.delete({
      user,
    });

    return friendsDeleted.affected ?? 0;
  }

  async listFriends(user: User): Promise<Friend[]> {
    this.log(`Listing friends for user ${user?.lastFMUsername}`);

    return await Friend.find({ user });
  }

  async isAlreadyFriends(
    authorUser: User,
    username?: string,
    user?: User
  ): Promise<boolean> {
    this.log(
      `Checking if ${authorUser.discordID} is already friends with ${username}`
    );

    const friends = await Friend.find({ user: authorUser });

    return friends.some(
      (f) =>
        (username && f.friendUsername === username) ||
        (user && f.friend?.id === user?.id)
    );
  }

  async getUsernames(user: User): Promise<string[]> {
    return (await this.listFriends(user)).map(
      (f) =>
        (f.friend?.lastFMUsername?.toLowerCase() ||
          f.friendUsername?.toLowerCase())!
    );
  }

  async friendsCount(user: User): Promise<number> {
    this.log(`Counting friends for user ${user.lastFMUsername}`);

    return (await this.listFriends(user)).length;
  }
}
