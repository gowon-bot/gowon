import { Friend } from "../database/entity/Friend";
import { bold } from "./discord";

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
