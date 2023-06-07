import { gql } from "@apollo/client";
import { Guild as DiscordGuild } from "discord.js";
import { Guild } from "../../database/entity/meta/Guild";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";

export class LilacGuildsService extends LilacAPIService {
  public async addUser(
    ctx: GowonContext,
    discordID: string,
    guildID: string
  ): Promise<Error | undefined> {
    try {
      await this.mutate<void, { discordID: string; guildID: string }>(
        ctx,
        gql`
          mutation addUserToGuild($discordID: String!, $guildID: String!) {
            addUserToGuild(discordID: $discordID, guildID: $guildID) {
              user {
                id
              }
              guildID
            }
          }
        `,
        { discordID, guildID }
      );
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
    }

    return;
  }

  public async removeUser(
    ctx: GowonContext,
    discordID: string,
    guildID: string
  ): Promise<Error | undefined> {
    try {
      await this.mutate<void, { discordID: string; guildID: string }>(
        ctx,
        gql`
          mutation removeUserFromGuild($discordID: String!, $guildID: String!) {
            removeUserFromGuild(discordID: $discordID, guildID: $guildID)
          }
        `,
        { discordID, guildID }
      );
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
    }

    return;
  }

  public async sync(
    ctx: GowonContext,
    guildID: string,
    discordIds: string[]
  ): Promise<void> {
    const mutation = gql`
      mutation syncGuild($guildID: String!, $discordIds: [String!]!) {
        syncGuild(guildID: $guildID, discordIds: $discordIds)
      }
    `;

    await this.mutate<void, { discordIds: string[]; guildID: string }>(
      ctx,
      mutation,
      {
        discordIds,
        guildID,
      }
    );

    this.updateGuildLastSynced(guildID);
  }

  public async clear(ctx: GowonContext, guildID: string): Promise<void> {
    const mutation = gql`
      mutation clearGuild($guildID: String!) {
        clearGuild(guildID: $guildID)
      }
    `;

    await this.mutate<void, { guildID: string }>(ctx, mutation, {
      guildID,
    });
  }

  public async create(guildID: string): Promise<Guild> {
    const guild = Guild.create({
      discordID: guildID,
      lastSynced: new Date(),
    });

    return await guild.save();
  }

  public async syncIfRequired(
    ctx: GowonContext,
    discordGuild: DiscordGuild
  ): Promise<void> {
    const guild = await Guild.findOneBy({ discordID: discordGuild.id });

    if (guild?.shouldSync()) {
      const members = await discordGuild.members.fetch();

      const discordIDs = members.map((m) => m.id);

      this.sync(ctx, discordGuild.id, discordIDs);
    }
  }

  private async updateGuildLastSynced(guildID: string): Promise<void> {
    const guild = await this.fetchOrCreate(guildID);

    guild.lastSynced = new Date();

    await guild.save();
  }

  private async fetchOrCreate(guildID: string): Promise<Guild> {
    const guild = await Guild.findOneBy({ discordID: guildID });

    if (guild) return guild;

    return await this.create(guildID);
  }
}
