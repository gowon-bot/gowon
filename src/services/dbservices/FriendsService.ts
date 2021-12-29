import { Friend } from "../../database/entity/Friend";
import {
  AlreadyFriendsError,
  NotFriendsError,
  LastFMUserDoesntExistError,
  TooManyFriendsError,
} from "../../errors";
import { BaseService, BaseServiceContext } from "../BaseService";
import { User } from "../../database/entity/User";
import { LastFMService } from "../LastFM/LastFMService";
import { ILike } from "typeorm";
import { ServiceRegistry } from "../ServicesRegistry";
import { sqlLikeEscape } from "../../helpers/database";

export class FriendsService extends BaseService {
  private get lastFMService() {
    return ServiceRegistry.get(LastFMService);
  }
  private friendsLimit = 10;
  private patronFriendsLimit = 15;

  async addFriend(
    ctx: BaseServiceContext,
    user: User,
    friendToAdd: string | User
  ): Promise<Friend> {
    this.log(
      ctx,
      `Adding friend ${
        typeof friendToAdd === "string"
          ? friendToAdd
          : friendToAdd.lastFMUsername
      } for user ${user.lastFMUsername}`
    );

    if (
      (await this.friendsCount(ctx, user)) >=
      (user.isPatron ? this.patronFriendsLimit : this.friendsLimit)
    ) {
      throw new TooManyFriendsError(
        user.isPatron ? this.patronFriendsLimit : this.friendsLimit,
        ctx.command.prefix,
        !user.isPatron
      );
    }

    let friend: Friend | undefined;

    if (friendToAdd instanceof User) {
      friend = await Friend.findOne({ user, friend: friendToAdd });
    } else {
      if (!(await this.lastFMService.userExists(ctx, friendToAdd))) {
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

  async removeFriend(
    ctx: BaseServiceContext,
    user: User,
    friendToRemove: string | User
  ): Promise<void> {
    this.log(
      ctx,
      `Removing friend ${
        typeof friendToRemove === "string"
          ? friendToRemove
          : friendToRemove.lastFMUsername
      } for user ${user.lastFMUsername}`
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
          friendUsername: ILike(sqlLikeEscape(friendToRemove.lastFMUsername)),
        },
      ];
    } else {
      where = {
        friendUsername: ILike(sqlLikeEscape(friendToRemove)),
      };
    }

    const friend = await Friend.findOne({
      where,
    });

    if (!friend) throw new NotFriendsError();

    await friend.remove();
  }

  async clearFriends(ctx: BaseServiceContext, user: User): Promise<number> {
    this.log(
      ctx,
      `Removing friend all friends for user ${user.lastFMUsername}`
    );

    let friendsDeleted = await Friend.delete({
      user,
    });

    return friendsDeleted.affected ?? 0;
  }

  async listFriends(ctx: BaseServiceContext, user: User): Promise<Friend[]> {
    this.log(ctx, `Listing friends for user ${user?.lastFMUsername}`);

    return await Friend.find({ user });
  }

  async isAlreadyFriends(
    ctx: BaseServiceContext,
    user: User,
    friend: string | User
  ): Promise<boolean> {
    this.log(
      ctx,
      `Checking if ${user.discordID} is already friends with ${friend}`
    );

    const friends = await Friend.find({ user });

    return friends.some((f) =>
      typeof friend === "string"
        ? f.friendUsername === friend
        : f.friend?.id === friend.id
    );
  }

  async getUsernames(ctx: BaseServiceContext, user: User): Promise<string[]> {
    return (await this.listFriends(ctx, user)).map(
      (f) =>
        (f.friend?.lastFMUsername?.toLowerCase() ||
          f.friendUsername?.toLowerCase())!
    );
  }

  async friendsCount(ctx: BaseServiceContext, user: User): Promise<number> {
    this.log(ctx, `Counting friends for user ${user.lastFMUsername}`);

    return (await this.listFriends(ctx, user)).length;
  }
}
