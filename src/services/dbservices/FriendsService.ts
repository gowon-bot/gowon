import { ILike } from "typeorm";
import { Friend } from "../../database/entity/Friend";
import { User } from "../../database/entity/User";
import {
  AlreadyFriendsError,
  AlreadyNotFriendsError,
  TooManyFriendsError,
} from "../../errors/friends";
import { sqlLikeEscape } from "../../helpers/database";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";

export class FriendsService extends BaseService {
  private friendsLimit = 10;
  private patronFriendsLimit = 15;

  public async addFriend(
    ctx: GowonContext,
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

    const friend = await this.getFriend(ctx, user, friendToAdd);

    if (friend) {
      throw new AlreadyFriendsError();
    }

    const newFriend = Friend.create({ user });

    if (friendToAdd instanceof User) {
      newFriend.friend = friendToAdd;
    } else {
      newFriend.friendUsername = friendToAdd;
    }

    await newFriend.save();
    return newFriend;
  }

  public async removeFriend(ctx: GowonContext, friend?: Friend): Promise<void> {
    this.log(ctx, `Removing friend ${friend?.id} for user ${friend?.user?.id}`);

    if (!friend) {
      throw new AlreadyNotFriendsError();
    }

    await friend.remove();
  }

  public async clearFriends(ctx: GowonContext, user: User): Promise<number> {
    this.log(
      ctx,
      `Removing friend all friends for user ${user.lastFMUsername}`
    );

    const friendsDeleted = await Friend.delete({
      user: { id: user.id },
    });

    return friendsDeleted.affected ?? 0;
  }

  public async listFriends(ctx: GowonContext, user: User): Promise<Friend[]> {
    this.log(ctx, `Listing friends for user ${user?.lastFMUsername}`);

    return await Friend.findBy({ user: { id: user.id } });
  }

  public async isAlreadyFriends(
    ctx: GowonContext,
    user: User,
    friend: string | User
  ): Promise<boolean> {
    this.log(
      ctx,
      `Checking if ${user.discordID} is already friends with ${friend}`
    );

    return !!(await this.getFriend(ctx, user, friend));
  }

  public async getUsernames(ctx: GowonContext, user: User): Promise<string[]> {
    return (await this.listFriends(ctx, user)).map(
      (f) =>
        (f.friend?.lastFMUsername?.toLowerCase() ||
          f.friendUsername?.toLowerCase())!
    );
  }

  public async friendsCount(ctx: GowonContext, user: User): Promise<number> {
    this.log(ctx, `Counting friends for user ${user.id}`);

    return (await this.listFriends(ctx, user)).length;
  }

  public async aliasFriend(
    ctx: GowonContext,
    friend: Friend,
    alias: string
  ): Promise<Friend> {
    this.log(
      ctx,
      `Aliasing friend ${friend.friendUsername} as ${alias} for user ${friend.user.id}`
    );

    friend.alias = alias;
    return await friend.save();
  }

  public async getFriend(
    ctx: GowonContext,
    user: User,
    friendToFind: string | User
  ): Promise<Friend | undefined> {
    this.log(ctx, `Fetching friend ${friendToFind} for user ${user.id}`);

    if (friendToFind instanceof User) {
      const friend = await Friend.findOneBy({
        user: { id: user.id },
        friend: { id: friendToFind.id },
      });

      return friend ?? undefined;
    } else {
      const friend = await Friend.findOne({
        where: [
          {
            user: { id: user.id },
            friendUsername: ILike(sqlLikeEscape(friendToFind)),
          },
          {
            user: { id: user.id },
            friend: { lastFMUsername: ILike(sqlLikeEscape(friendToFind)) },
          },
        ],
      });

      return friend ?? undefined;
    }
  }

  public async getFriendByAlias(
    user: User,
    alias: string
  ): Promise<Friend | undefined> {
    const friend = await Friend.findOneBy({
      user: { id: user.id },
      alias: ILike(sqlLikeEscape(alias)),
    });

    return friend ?? undefined;
  }
}
