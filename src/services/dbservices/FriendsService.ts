import { Friend } from "../../database/entity/Friend";
import {
  AlreadyFriendsError,
  NotFriendsError,
  LastFMUserDoesntExistError,
  TooManyFriendsError,
} from "../../errors";
import { LastFMService } from "../LastFM/LastFMService";
import { Track } from "../LastFM/LastFMService.types";
import { BaseService } from "../BaseService";
import { User } from "../../database/entity/User";

export interface FriendNowPlaying {
  friendUsername: string;
  nowPlaying: Track;
}

export class FriendsService extends BaseService {
  private lastFMService = new LastFMService();
  private friendsLimit = 10;

  async addFriend(
    serverID: string,
    user: User,
    friendUsername: string
  ): Promise<Friend> {
    this.log(
      `Adding friend ${friendUsername} for user ${user.lastFMUsername} in server ${serverID}`
    );

    if ((await this.friendsCount(serverID, user)) >= this.friendsLimit)
      throw new TooManyFriendsError(this.friendsLimit);

    let friend = await Friend.findOne({ user, friendUsername, serverID });

    if (friend) throw new AlreadyFriendsError();

    if (!(await this.lastFMService.userExists(friendUsername)))
      throw new LastFMUserDoesntExistError();

    friend = Friend.create({
      user,
      friendUsername: friendUsername.toLowerCase(),
      serverID,
    });
    await friend.save();
    return friend;
  }

  async removeFriend(
    serverID: string,
    user: User,
    friendUsername: string
  ): Promise<void> {
    this.log(
      `Removing friend ${friendUsername} for user ${user.lastFMUsername} in ${serverID}`
    );
    let friend = await Friend.findOne({
      serverID,
      user,
      friendUsername: friendUsername.toLowerCase(),
    });

    if (!friend) throw new NotFriendsError();

    await friend.remove();
  }

  async clearFriends(serverID: string, user: User): Promise<number> {
    this.log(
      `Removing friend all friends for user ${user.lastFMUsername} in ${serverID}`
    );
    let friendsDeleted = await Friend.delete({
      serverID,
      user,
    });

    return friendsDeleted.affected ?? 0;
  }

  async listFriends(serverID: string, user: User): Promise<Friend[]> {
    this.log(`Listing friends for user ${user?.lastFMUsername}`);
    return await Friend.find({ user, serverID });
  }

  async getUsernames(serverID: string, user: User): Promise<string[]> {
    return (await this.listFriends(serverID, user)).map((f) =>
      f.friendUsername.toLowerCase()
    );
  }

  async friendsCount(serverID: string, user: User): Promise<number> {
    this.log(`Counting friends for user ${user.lastFMUsername}`);
    return (await this.listFriends(serverID, user)).length;
  }
}
