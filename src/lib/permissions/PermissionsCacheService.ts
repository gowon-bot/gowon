import { Permission, PermissionType } from "../../database/entity/Permission";
import { SimpleMap } from "../../helpers/types";
import { BaseService } from "../../services/BaseService";
import { Command } from "../command/Command";
import { GowonContext } from "../context/Context";
import {
  PermissionCacheKey,
  PermissionsCache,
  generateCacheKey,
} from "./PermissionsCache";

export interface PermissionQuery {
  type?: PermissionType;
  entityID?: string;
  commandID?: string;
}

export type PermissionsCacheMutableContext = {
  cache?: PermissionsCache;
};

export type PermissionsCacheContext = GowonContext<{
  mutable?: PermissionsCacheMutableContext;
  constants?: { isAdmin?: boolean };
}>;

export class PermissionsCacheService extends BaseService<PermissionsCacheContext> {
  get(ctx: PermissionsCacheContext, query: Required<PermissionQuery>) {
    return this.cache(ctx).get(
      generateCacheKey(query.type, query.commandID, query.entityID)
    );
  }

  async cachePermissionsInContext(
    ctx: PermissionsCacheContext,
    queries: PermissionQuery[]
  ): Promise<void> {
    const perms = await this.getPermissionsFromQueries(ctx, queries);

    for (const [key, value] of Object.entries(perms)) {
      this.cache(ctx).set(
        key.replace("gowon:", "") as PermissionCacheKey,
        value
      );
    }
  }

  getAllPermissionQueries(
    ctx: PermissionsCacheContext,
    command?: Command
  ): PermissionQuery[] {
    const queries = [
      {
        type: PermissionType.bot,
        commandID: command?.id,
      },
      {
        type: PermissionType.user,
        entityID: ctx.author.id,
        commandID: command?.id,
      },
    ];

    if (ctx.payload.channel) {
      queries.push({
        type: PermissionType.channel,
        entityID: ctx.payload.channel.id,
        commandID: command?.id,
      });
    }

    if (ctx.guild) {
      const roles = ctx.requiredAuthorMember?.roles;

      queries.push(
        {
          type: PermissionType.guild,
          entityID: ctx.guild!.id,
          commandID: command?.id,
        },
        {
          type: PermissionType.guildMember,
          entityID: `${ctx.guild!.id}:${ctx.author.id}`,
          commandID: command?.id,
        },
        ...roles?.cache?.map((r) => ({
          type: PermissionType.role,
          entityID: r.id,
          commandID: command?.id,
        }))
      );
    }

    return queries;
  }

  private cache(ctx: PermissionsCacheContext): PermissionsCache {
    if (!ctx.mutable.cache) {
      ctx.mutable.cache = new PermissionsCache();
    }

    return ctx.mutable.cache;
  }

  private async getPermissionsFromQueries(
    ctx: PermissionsCacheContext,
    queries: PermissionQuery[]
  ): Promise<SimpleMap<boolean>> {
    return (await Permission.getFromQueries(queries, ctx.guild?.id)).reduce(
      (acc, val) => {
        acc[val.asCacheKey()] = val.allow;

        return acc;
      },
      {} as SimpleMap<boolean>
    );
  }
}
