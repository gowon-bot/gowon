import { promiseAllSettled, sleep } from "../helpers";
import { LastFMService } from "../services/LastFM/LastFMService";

export interface FetchedResponses<T> {
  [username: string]: T | undefined;
}

export class MultiRequester {
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
      let fetched = await promiseAllSettled(
        this.usernames.map((u) =>
          method(...params.insertAtIndex(options?.usernameInPosition || 0, u))
        )
      );

      return fetched.reduce((acc, f, idx) => {
        acc[this.usernames[idx]] =
          f.status === "fulfilled" ? f.value : undefined;
        return acc;
      }, {} as FetchedResponses<T>);
    } else {
      let fetched = await promiseAllSettled(
        this.usernames.map(async (u, idx) => {
          console.log({ ...params, username: u });

          await sleep(idx * 1000);
          return method({ ...params, username: u } as ParamsT);
        })
      );

      return fetched.reduce((acc, f, idx) => {
        acc[this.usernames[idx]] =
          f.status === "fulfilled" ? f.value : undefined;
        return acc;
      }, {} as FetchedResponses<T>);
    }
  }
}
