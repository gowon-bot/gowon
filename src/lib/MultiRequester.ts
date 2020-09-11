import { LastFMService } from "../services/LastFM/LastFMService";

export interface FetchedResponses<T> {
  [username: string]: T;
}

export class MultiRequster {
  lastFMService = new LastFMService();

  constructor(public usernames: string[]) {}

  async fetch<T, ParamsT>(
    method: (params: ParamsT) => Promise<T>,
    params: ParamsT,
    options?: {}
  ): Promise<FetchedResponses<T>>;
  async fetch<T>(
    method: (...params: any[]) => Promise<T>,
    params: any[],
    options?: { usernameInPosition?: number }
  ): Promise<FetchedResponses<T>>;
  async fetch<T, ParamsT>(
    method: (...params: any[]) => Promise<T>,
    params: any,
    options?: any
  ): Promise<FetchedResponses<T>> {
    if (params instanceof Array) {
      let fetched = await Promise.all(
        this.usernames.map((u) =>
          method(...params.insertAtIndex(options?.usernameInPosition || 0, u))
        )
      );

      return fetched.reduce((acc, f, idx) => {
        acc[this.usernames[idx]] = f;
        return acc;
      }, {} as FetchedResponses<T>);
    } else {
      let fetched = await Promise.all(
        this.usernames.map((u) => method({ ...params, username: u } as ParamsT))
      );

      return fetched.reduce((acc, f, idx) => {
        acc[this.usernames[idx]] = f;
        return acc;
      }, {} as FetchedResponses<T>);
    }
  }
}
