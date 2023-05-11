import { NoFriendsError } from "../../../errors/commands/friends";
import { code } from "../../../helpers/discord";
import { FriendsList } from "../../../helpers/friends";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import {
  GetMentionsOptions,
  Mentions,
} from "../../../services/arguments/mentions/MentionsService.types";
import { FriendsService } from "../../../services/dbservices/FriendsService";
import { LastFMBaseChildCommand } from "../LastFMBaseCommand";

export type FriendsMentions = Mentions & {
  friends: FriendsList;
};

type FriendsOptions = Partial<GetMentionsOptions> & {
  fetchFriendsList?: boolean;
  friendsRequired?: boolean;
};

export abstract class FriendsChildCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseChildCommand<T> {
  parentName = "friends";

  friendsService = ServiceRegistry.get(FriendsService);

  async getMentions(options: FriendsOptions): Promise<FriendsMentions> {
    const mentions = (await super.getMentions(options)) as FriendsMentions;

    if (options.fetchFriendsList) {
      const { senderUsername, senderUser } = mentions;

      const friends = await this.friendsService.listFriends(
        this.ctx,
        senderUser!
      );

      mentions.friends = new FriendsList(
        friends,
        senderUsername,
        this.ctx.author.id
      );

      if (options.friendsRequired) {
        this.ensureFriends(mentions.friends);
      }
    }

    return mentions as FriendsMentions;
  }

  protected displayMissingFriend(username: string, entity = "playcount") {
    return `${code(username)} - _Error fetching ${entity}_`;
  }

  private ensureFriends(friends: FriendsList) {
    if (!friends.length()) {
      throw new NoFriendsError();
    }
  }
}
