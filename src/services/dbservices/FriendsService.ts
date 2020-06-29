import { Friend } from "../../database/entity/Friend";
import {
  AlreadyFriendsError,
  NotFriendsError,
  LastFMUserDoesntExistError,
} from "../../errors";
import { LastFMService } from "../LastFMService";
import { Track } from "../LastFMService.types";
import { BaseService } from "../BaseService";

export interface FriendNowPlaying {
  friendUsername: string;
  nowPlaying: Track;
}

export class FriendsService extends BaseService {
  lastFMService = new LastFMService();

  async addFriend(userID: string, friendUsername: string): Promise<Friend> {
    this.log(`Adding friend ${friendUsername} for user ${userID}`);
    let friend = await Friend.findOne({ userID, friendUsername });

    if (friend) throw new AlreadyFriendsError();

    if (!(await this.lastFMService.userExists(friendUsername)))
      throw new LastFMUserDoesntExistError();

    friend = Friend.create({ userID, friendUsername });
    await friend.save();
    return friend;
  }

  async removeFriend(userID: string, friendUsername: string): Promise<void> {
    this.log(`Removing friend ${friendUsername} for user ${userID}`);
    let friend = await Friend.findOne({ userID, friendUsername });

    if (!friend) throw new NotFriendsError();

    await friend.remove();
  }

  async listFriends(userID: string): Promise<Friend[]> {
    this.log(`Listing friends for user ${userID}`);
    return await Friend.find({ userID });
  }

  async friendsNowPlaying(friends: Friend[]): Promise<FriendNowPlaying[]> {
    this.log(`Fetching nowPlaying for friends ${friends.join(", ")}`);
    let nowPlayingArray = await Promise.all(
      friends.map((f) => this.lastFMService.recentTracks(f.friendUsername, 1))
    );

    return nowPlayingArray.map(
      (np) =>
        ({
          friendUsername: np["@attr"].user,
          nowPlaying: np.track[0],
        } as FriendNowPlaying)
    );
  }
}
