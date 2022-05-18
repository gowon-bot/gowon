import { gql, Observable } from "@apollo/client";
import { LilacAPIService } from "./LilacAPIService";
import { IndexingProgress, LilacUserInput } from "./LilacAPIService.types";

export class LilacUsersService extends LilacAPIService {
  async index(user: LilacUserInput): Promise<void> {
    await this.mutate<{ index: any }, { user: LilacUserInput }>(
      gql`
        mutation index($user: UserInput!) {
          index(user: $user)
        }
      `,
      { user }
    );
  }

  async update(user: LilacUserInput): Promise<void> {
    await this.mutate<{ update: any }, { user: LilacUserInput }>(
      gql`
        mutation update($user: UserInput!) {
          update(user: $user)
        }
      `,
      { user }
    );
  }

  indexingProgress(user: LilacUserInput): Observable<IndexingProgress> {
    const subscription = gql`
      subscription index($user: UserInput!) {
        index(user: $user) {
          action
          page
          totalPages
        }
      }
    `;

    return this.subscribe<
      { index: IndexingProgress },
      { user: LilacUserInput }
    >(subscription, { user }).map((data) => data.index);
  }
}
