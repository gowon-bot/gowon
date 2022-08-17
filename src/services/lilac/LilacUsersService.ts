import { gql, Observable } from "@apollo/client";
import { GowonContext } from "../../lib/context/Context";
import { userToUserInput } from "./helpers";
import { LilacAPIService } from "./LilacAPIService";
import { IndexingProgress, LilacUserInput } from "./LilacAPIService.types";

export class LilacUsersService extends LilacAPIService {
  async index(ctx: GowonContext, user: LilacUserInput): Promise<void> {
    await this.mutate<{ index: any }, { user: LilacUserInput }>(
      ctx,
      gql`
        mutation index($user: UserInput!) {
          index(user: $user)
        }
      `,
      { user: userToUserInput(user) }
    );
  }

  async update(ctx: GowonContext, user: LilacUserInput): Promise<void> {
    await this.mutate<{ update: any }, { user: LilacUserInput }>(
      ctx,
      gql`
        mutation update($user: UserInput!) {
          update(user: $user)
        }
      `,
      { user: userToUserInput(user) }
    );
  }

  indexingProgress(
    ctx: GowonContext,
    user: LilacUserInput
  ): Observable<IndexingProgress> {
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
    >(ctx, subscription, { user: userToUserInput(user) }).map(
      (data) => data.index
    );
  }
}
