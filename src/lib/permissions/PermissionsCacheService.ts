import { Permission, PermissionType } from "../../database/entity/Permission";
import { SimpleMap } from "../../helpers/types";
import { BaseService } from "../../services/BaseService";
import {
  RedisService,
  RedisServiceContextOptions,
} from "../../services/redis/RedisService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { Command } from "../command/Command";
import { GowonContext } from "../context/Context";
import {
  generateCacheKey,
  PermissionCacheKey,
  PermissionsCache,
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
  constants?: { redisOptions?: RedisServiceContextOptions; isAdmin?: boolean };
}>;

export class PermissionsCacheService extends BaseService<PermissionsCacheContext> {
  private get redisService() {
    return ServiceRegistry.get(RedisService);
  }

  async init(ctx: PermissionsCacheContext) {
    await this.savePermissionsToRedis(ctx);
  }

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

  async savePermissionsToRedis(ctx: PermissionsCacheContext) {
    const permissions = await Permission.find();

    for (const permission of permissions) {
      await this.savePermissionToRedis(ctx, permission);
    }
  }

  async savePermissionToRedis(
    ctx: PermissionsCacheContext,
    permission: Permission
  ): Promise<void> {
    await this.redisService.set(
      ctx,
      permission.asCacheKey(),
      permission.allow ? "true" : "false"
    );
  }

  async deletePermissionFromRedis(
    ctx: PermissionsCacheContext,
    permission: Permission
  ): Promise<void> {
    await this.redisService.delete(ctx, permission.asCacheKey());
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
      const roles = ctx.authorMember?.roles;

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
  ): Promise<SimpleMap<string>> {
    const allPermissions = {} as SimpleMap<string>;

    const queryPromises = queries.map((q) =>
      this.redisService.getMany(
        ctx,
        generateCacheKey(
          q.type || ("*" as any),
          q.commandID || "*",
          q.entityID || "*"
        )
      )
    );

    const exectuedQueries = await Promise.all(queryPromises);

    for (const map of exectuedQueries) {
      for (const [key, value] of Object.entries(map)) {
        allPermissions[key] = value;
      }
    }

    return allPermissions;
  }
}
