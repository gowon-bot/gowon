import { gql, Observable } from "@apollo/client";
import { GowonContext } from "../../lib/context/Context";
import { LilacUser } from "./converters/user";
import { userToUserInput } from "./helpers";
import { LilacAPIService } from "./LilacAPIService";
import {
  LilacUserInput,
  LilacUserModifications,
  RawLilacUser,
  SyncProgress,
} from "./LilacAPIService.types";

export const PrivateUserDisplay = "Private user";

export class LilacUsersService extends LilacAPIService {
  public async sync(
    ctx: GowonContext,
    user: LilacUserInput,
    forceRestart = false
  ): Promise<void> {
    await this.mutate<
      { index: any },
      { user: LilacUserInput; forceRestart: boolean }
    >(
      ctx,
      gql`
        mutation sync($user: UserInput!, $forceRestart: Boolean!) {
          sync(user: $user, forceRestart: $forceRestart)
        }
      `,
      { user: userToUserInput(user), forceRestart }
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

  public syncProgress(
    ctx: GowonContext,
    user: LilacUserInput
  ): Observable<SyncProgress> {
    const subscription = gql`
      subscription sync($user: UserInput!) {
        sync(user: $user) {
          action
          stage
          current
          total
        }
      }
    `;

    return this.subscribe<{ sync: SyncProgress }, { user: LilacUserInput }>(
      ctx,
      subscription,
      { user: userToUserInput(user) }
    ).map((data) => data.sync);
  }

  public async fetchAll(
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
            lastSynced
          }
        }
      `,
      { filters },
      false
    );

    return users.users.map((u) => new LilacUser(u));
  }

  public async fetch(
    ctx: GowonContext,
    filters: LilacUserInput
  ): Promise<LilacUser | undefined> {
    return (await this.fetchAll(ctx, filters))[0];
  }

  public async isBeingIndexed(
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
            isSyncing
          }
        }
      `,
      { filters },
      false
    );

    return users.users[0]?.isSyncing ?? false;
  }

  public async modify(
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

  public async login(
    ctx: GowonContext,
    username: string,
    lastFmSession: string
  ): Promise<LilacUser> {
    const discordId = ctx.author.id;

    const user = await this.mutate<
      RawLilacUser,
      { username: string; lastFmSession: string; discordId: string }
    >(
      ctx,
      gql`
        mutation login(
          $username: String!
          $discordId: String!
          $lastFmSession: String!
        ) {
          login(
            username: $username
            discordId: $discordId
            lastFmSession: $lastFmSession
          ) {
            id
            username
            discordID
          }
        }
      `,
      { username, discordId, lastFmSession }
    );

    return new LilacUser(user);
  }

  public async logout(ctx: GowonContext): Promise<void> {
    await this.mutate<void, { user: LilacUserInput }>(
      ctx,
      gql`
        mutation logout($user: UserInput!) {
          logout(user: $user)
        }
      `,
      { user: { discordID: ctx.author.id } }
    );
  }
}
