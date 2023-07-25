import { IsNull } from "typeorm";
import { TagBan } from "../database/entity/TagBan";
import {
  TagAlreadyBannedError,
  TagBannedByDefaultError,
  TagNotAllowedError,
  TagNotBannedError,
} from "../errors/commands/tags";
import { GowonContext } from "../lib/context/Context";
import { SettingsService } from "../lib/settings/SettingsService";
import { BaseService } from "./BaseService";
import { GowonService } from "./GowonService";
import { ServiceRegistry } from "./ServicesRegistry";

interface TagBlacklistGroup {
  strings: string[];
  regexes: RegExp[];
}

type TagBlacklistServiceContext = GowonContext<{
  mutable?: {
    serverBannedTags?: TagBan[];
  };
}>;

export class TagBlacklistService extends BaseService<TagBlacklistServiceContext> {
  get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor() {
    super();
  }

  public filter<T extends string | { name: string }>(
    ctx: TagBlacklistServiceContext,
    items: T[],
    customBlacklist: string[] = []
  ): T[] {
    return items.filter((item) => this.isAllowed(ctx, item, customBlacklist));
  }

  public isAllowed(
    ctx: TagBlacklistServiceContext,
    item: string | { name: string },
    customBlacklist: string[] = []
  ): boolean {
    const blacklistGroup = this.getBlacklists(customBlacklist);

    return (
      !blacklistGroup.strings.includes(this.normalizeItem(item)) &&
      !blacklistGroup.regexes.some(
        (regex) =>
          regex.test(this.getItemName(item)) ||
          regex.test(this.normalizeItem(item))
      ) &&
      !ctx.mutable.serverBannedTags?.some(
        (bt) => this.normalizeItem(bt.tag) === this.normalizeItem(item)
      )
    );
  }

  public throwIfTagNotAllowedAsInput(
    ctx: TagBlacklistServiceContext,
    tag: string | { name: string }
  ): void {
    const strictTagBans = this.settingsService.get("strictTagBans", {
      guildID: ctx.requiredGuild.id,
    });

    if (!!strictTagBans && !this.isAllowed(ctx, tag)) {
      throw new TagNotAllowedError();
    }
  }

  public async banTag(
    ctx: TagBlacklistServiceContext,
    tag: string,
    guildID?: string,
    isRegex?: boolean
  ): Promise<TagBan> {
    this.log(ctx, `Banning tag ${tag} in ${guildID || "Gowon"}`);

    if (!this.isAllowed(ctx, tag)) {
      throw new TagBannedByDefaultError();
    }

    const normalizedTag = !isRegex ? this.normalizeItem(tag) : tag;

    const existingBan = await TagBan.findOneBy({
      serverID: guildID || IsNull(),
      tag: normalizedTag,
      isRegex,
    });

    if (existingBan) throw new TagAlreadyBannedError(guildID);

    const newBan = TagBan.create({
      serverID: guildID,
      tag: normalizedTag,
      isRegex,
    });

    const savedNewBan = await newBan.save();

    if (!guildID) {
      this.gowonService.cache.fetchGlobalBannedTag(savedNewBan);
    }

    return savedNewBan;
  }

  public async unbanTag(
    ctx: TagBlacklistServiceContext,
    tag: string,
    guildID?: string,
    isRegex?: boolean
  ): Promise<void> {
    this.log(ctx, `Unbanning tag ${tag} in ${guildID || "Gowon"}`);

    const existingBan = await TagBan.findOneBy({
      serverID: guildID || IsNull(),
      tag: this.normalizeItem(tag),
      isRegex,
    });

    if (!existingBan) throw new TagNotBannedError(guildID);

    await existingBan.remove();

    if (!guildID) {
      this.gowonService.cache.deleteGlobalBannedTag(existingBan);
    }
  }

  public async getServerBannedTags(
    ctx: TagBlacklistServiceContext
  ): Promise<TagBan[]> {
    this.log(ctx, `Getting banned tags for ${ctx.requiredGuild.id}`);
    return await TagBan.findBy({ serverID: ctx.requiredGuild.id });
  }

  public async saveServerBannedTagsInContext(ctx: TagBlacklistServiceContext) {
    if (ctx.guild) {
      ctx.mutable.serverBannedTags = await this.getServerBannedTags(ctx);
    }
  }

  private getBlacklists(customBlacklist: string[] = []): TagBlacklistGroup {
    const { regexs, strings } = this.gowonService.cache.fetchGlobalBannedTags();

    return {
      strings: strings.concat(
        customBlacklist.map((t) => this.normalizeItem(t))
      ),
      regexes: regexs,
    };
  }

  private normalizeItem(item: string | { name: string }): string {
    return this.getItemName(item).replace(/\s+/g, "").toLowerCase();
  }

  private getItemName(item: string | { name: string }) {
    return typeof item === "string" ? item : item.name;
  }
}
