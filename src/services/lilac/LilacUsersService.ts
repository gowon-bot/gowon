import { gql, Observable } from "@apollo/client";
import { GowonContext } from "../../lib/context/Context";
import { LilacUser } from "./converters/user";
import { userToUserInput } from "./helpers";
import { LilacAPIService } from "./LilacAPIService";
import {
  IndexingProgress,
  LilacUserInput,
  LilacUserModifications,
  RawLilacUser,
} from "./LilacAPIService.types";

export class LilacUsersService extends LilacAPIService {
  public async index(ctx: GowonContext, user: LilacUserInput): Promise<void> {
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

  public async update(ctx: GowonContext, user: LilacUserInput): Promise<void> {
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

  public indexingProgress(
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

  public async fetchUsers(
    ctx: GowonContext,
    filters?: LilacUserInput
  ): Promise<LilacUser[]> {
    const users = await this.query<
      { users: RawLilacUser[] },
      { filters?: LilacUserInput }
    >(
      ctx,
      gql`
        query fetchUsers($filters: UserInput) {
          users(filters: $filters) {
            id
            discordID
            username
            privacy
            lastIndexed
          }
        }
      `,
      { filters },
      false
    );

    return users.users.map((u) => new LilacUser(u));
  }

  public async fetchUser(
    ctx: GowonContext,
    filters: LilacUserInput
  ): Promise<LilacUser | undefined> {
    return (await this.fetchUsers(ctx, filters))[0];
  }

  public async isUserBeingIndexed(
    ctx: GowonContext,
    filters: LilacUserInput
  ): Promise<boolean> {
    const users = await this.query<
      { users: RawLilacUser[] },
      { filters?: LilacUserInput }
    >(
      ctx,
      gql`
        query fetchUsers($filters: UserInput) {
          users(filters: $filters) {
            isIndexing
          }
        }
      `,
      { filters },
      false
    );

    return users.users[0]?.isIndexing ?? false;
  }

  public async modifyUser(
    ctx: GowonContext,
    user: LilacUserInput,
    modifications: LilacUserModifications
  ): Promise<LilacUser> {
    const response = await this.mutate<
      RawLilacUser,
      { user: LilacUserInput; modifications: LilacUserModifications }
    >(
      ctx,
      gql`
        mutation modifyUser(
          $user: UserInput
          $modifications: UserModifications
        ) {
          modifyUser(user: $user, modifications: $modifications) {
            id
            discordID
            privacy
            username
          }
        }
      `,
      {
        user,
        modifications,
      }
    );

    return new LilacUser(response);
  }
}
