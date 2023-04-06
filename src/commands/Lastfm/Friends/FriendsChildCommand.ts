import { Friend } from "../../../database/entity/Friend";
import { NoFriendsError } from "../../../errors/friends";
import { bold, code } from "../../../helpers/discord";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { FriendsService } from "../../../services/dbservices/FriendsService";
import { LastFMBaseChildCommand } from "../LastFMBaseCommand";

export interface DisplayableFriend {
  display(): string;
  getUsername(): string;
  getDiscordID(): string | undefined;
  alias?: string;
}

export class FriendsList {
  constructor(
    private friends: Friend[],
    private senderUsername: string,
    private senderID: string
  ) {}

  usernames(): string[] {
    return [
      ...this.friends
        .filter((f) => !!f.getUsername())
        .map((f) => f.getUsername()),
      this.senderUsername,
    ];
  }

  discordIDs(): string[] {
    return [
      ...this.friends
        .filter((f) => !!f.getDiscordID())
        .map((f) => f.getDiscordID()!),
      this.senderID,
    ];
  }

  sortedList(): DisplayableFriend[] {
    return this.getDisplayables().sort((a, b) =>
      (a.alias || a.getUsername()).localeCompare(b.alias || b.getUsername())
    );
  }

  sortBy(pred: (f: DisplayableFriend) => number): DisplayableFriend[] {
    return this.getDisplayables().sort((a, b) => pred(b) - pred(a));
  }

  length(): number {
    return this.friends.length;
  }

  getFriend(discordID: string): DisplayableFriend {
    return this.getDisplayables().find((f) => f.getDiscordID() === discordID)!;
  }

  private getDisplayables(): DisplayableFriend[] {
    const senderUsername = this.senderUsername;
    const senderID = this.senderID;

    return [
      ...this.friends,
      {
        getDiscordID: () => senderID,
        getUsername: () => senderUsername,
        display: () => bold("You"),
      },
    ];
  }
}

export abstract class FriendsChildCommand<
  T extends ArgumentsMap = {}
> extends LastFMBaseChildCommand<T> {
  parentName = "friends";

  friendsService = ServiceRegistry.get(FriendsService);

  protected friends!: FriendsList;

  throwIfNoFriends = false;

  async beforeRun() {
    const senderUsername = await this.usersService.getUsername(
      this.ctx,
      this.author.id
    );

    await this.setFriends(senderUsername);

    if (this.throwIfNoFriends && this.friends.length() < 1) {
      throw new NoFriendsError();
    }
  }

  async setFriends(senderUsername: string) {
    const user = await this.usersService.getUser(this.ctx, this.author.id);

    const friends = await this.friendsService.listFriends(this.ctx, user);

    this.friends = new FriendsList(friends, senderUsername, this.ctx.author.id);
  }

  protected displayMissingFriend(username: string, entity = "playcount") {
    return `${code(username)} - _Error fetching ${entity}_`;
  }
}
