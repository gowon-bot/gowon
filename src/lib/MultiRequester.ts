import { promiseAllSettled } from "../helpers";
import { SimpleMap } from "../helpers/types";
import { Requestable } from "../services/LastFM/LastFMAPIService";

export interface FetchedResponses<T> {
  [username: string]: T | undefined;
}

export class MultiRequester {
  constructor(private ctx: SimpleMap, public requestables: Requestable[]) {}

  async fetch<T, ParamsT>(
    method: (ctx: SimpleMap, params: ParamsT) => Promise<T>,
    params: ParamsT,
    options?: {}
  ): Promise<FetchedResponses<T>>;
  async fetch<T>(
    method: (ctx: SimpleMap, ...params: any[]) => Promise<T>,
    params: any[],
    options?: { usernameInPosition?: number }
  ): Promise<FetchedResponses<T>>;
  async fetch<T, ParamsT>(
    method: (ctx: SimpleMap, ...params: any[]) => Promise<T>,
    params: any,
    options?: any
  ): Promise<FetchedResponses<T>> {
    if (params instanceof Array) {
      let fetched = await promiseAllSettled(
        this.requestables.map((u) =>
          method(
            this.ctx,
            ...params.insertAtIndex(options?.usernameInPosition || 0, u)
          )
        )
      );

      return fetched.reduce((acc, f, idx) => {
        acc[requestableAsUsername(this.requestables[idx])] =
          f.status === "fulfilled" ? f.value : undefined;
        return acc;
      }, {} as FetchedResponses<T>);
    } else {
      let fetched = await promiseAllSettled(
        this.requestables.map(async (u) =>
          method(this.ctx, { ...params, username: u } as ParamsT)
        )
      );

      return fetched.reduce((acc, f, idx) => {
        acc[requestableAsUsername(this.requestables[idx])] =
          f.status === "fulfilled" ? f.value : undefined;
        return acc;
      }, {} as FetchedResponses<T>);
    }
  }
}

export function requestableAsUsername(requestable: Requestable): string {
  return typeof requestable === "string" ? requestable : requestable.username;
}
