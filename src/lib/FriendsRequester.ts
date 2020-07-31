import { LastFMService } from "../services/LastFMService";

export interface FetchedResponses<T> {
  [username: string]: T;
}

export class FriendsRequester {
  usernames: string[];
  lastFMService = new LastFMService();

  constructor(usernames: string[]) {
    this.usernames = usernames;
  }

  async fetch<T>(
    method: (...params: any[]) => Promise<T>,
    params: any[] = [],
    options: { usernameInPosition?: number } = { usernameInPosition: 0 }
  ): Promise<FetchedResponses<T>> {
    let fetched = await Promise.all(
      this.usernames.map((u) => {
        return method(...params.insertAtIndex(options.usernameInPosition || 0, u));
      })
    );

    return fetched.reduce((acc, f, idx) => {
      acc[this.usernames[idx]] = f;
      return acc;
    }, {} as FetchedResponses<T>);
  }
}
