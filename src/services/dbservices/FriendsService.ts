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

export class FriendsService extends BaseService {
  private lastFMService = new LastFMService(this.logger);
  private friendsLimit = 10;

  async addFriend(user: User, friendUsername: string): Promise<Friend> {
    this.log(`Adding friend ${friendUsername} for user ${user.lastFMUsername}`);

    if ((await this.friendsCount(user)) >= this.friendsLimit)
      throw new TooManyFriendsError(this.friendsLimit);

    let friend = await Friend.findOne({ user, friendUsername });

    if (friend) throw new AlreadyFriendsError();

    if (!(await this.lastFMService.userExists(friendUsername)))
      throw new LastFMUserDoesntExistError();

    friend = Friend.create({
      user,
      friendUsername: friendUsername.toLowerCase(),
    });
    await friend.save();
    return friend;
  }

  async removeFriend(user: User, friendUsername: string): Promise<void> {
    this.log(
      `Removing friend ${friendUsername} for user ${user.lastFMUsername}`
    );
    let friend = await Friend.findOne({
      user,
      friendUsername: friendUsername.toLowerCase(),
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

  async getUsernames(user: User): Promise<string[]> {
    return (await this.listFriends(user)).map((f) =>
      f.friendUsername.toLowerCase()
    );
  }

  async friendsCount(user: User): Promise<number> {
    this.log(`Counting friends for user ${user.lastFMUsername}`);
    return (await this.listFriends(user)).length;
  }
}
