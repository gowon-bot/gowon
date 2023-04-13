import { IsNull } from "typeorm";
import { TagBan } from "../database/entity/TagBan";
import {
  TagAlreadyBannedError,
  TagBannedByDefaultError,
  TagNotAllowedError,
  TagNotBannedError,
} from "../errors/tags";
import { GowonContext } from "../lib/context/Context";
import { SettingsService } from "../lib/settings/SettingsService";
import { BaseService } from "./BaseService";
import { GowonService } from "./GowonService";
import { ServiceRegistry } from "./ServicesRegistry";

interface WordBlacklistGroup {
  strings: string[];
  regexes: RegExp[];
}

type WordBlacklistServiceContext = GowonContext<{
  mutable?: {
    serverBannedTags?: TagBan[];
  };
}>;

export class WordBlacklistService extends BaseService<WordBlacklistServiceContext> {
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
    ctx: WordBlacklistServiceContext,
    items: T[],
    customBlacklist: string[] = []
  ): T[] {
    return items.filter((item) => this.isAllowed(ctx, item, customBlacklist));
  }

  public isAllowed(
    ctx: WordBlacklistServiceContext,
    item: string | { name: string },
    customBlacklist: string[] = []
  ): boolean {
    const blacklistGroup = this.getBlacklists(customBlacklist);

    return (
      !blacklistGroup.strings.includes(this.normalizeItem(item)) &&
      !blacklistGroup.regexes.some((regex) =>
        regex.test(this.getItemName(item))
      ) &&
      !ctx.mutable.serverBannedTags?.some(
        (bt) => this.normalizeItem(bt.tag) === this.normalizeItem(item)
      )
    );
  }

  public throwIfTagNotAllowedAsInput(
    ctx: WordBlacklistServiceContext,
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
    ctx: WordBlacklistServiceContext,
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
      this.gowonService.cache.addGlobalBannedTag(savedNewBan);
    }

    return savedNewBan;
  }

  public async unbanTag(
    ctx: WordBlacklistServiceContext,
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
      this.gowonService.cache.removeGlobalBannedTag(existingBan);
    }
  }

  public async getServerBannedTags(
    ctx: WordBlacklistServiceContext
  ): Promise<TagBan[]> {
    this.log(ctx, `Getting banned tags for ${ctx.requiredGuild.id}`);
    return await TagBan.findBy({ serverID: ctx.requiredGuild.id });
  }

  public async saveServerBannedTagsInContext(ctx: WordBlacklistServiceContext) {
    if (ctx.guild) {
      ctx.mutable.serverBannedTags = await this.getServerBannedTags(ctx);
    }
  }

  private getBlacklists(customBlacklist: string[] = []): WordBlacklistGroup {
    const { regexs, strings } = this.gowonService.cache.getGlobalBannedTags();

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
