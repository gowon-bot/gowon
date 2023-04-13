import { GuildMember } from "discord.js";
import { CrownBan } from "../../../database/entity/CrownBan";
import { userHasRole } from "../../../helpers/discord";
import { GowonContext } from "../../../lib/context/Context";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { BaseService } from "../../BaseService";
import { DiscordService } from "../../Discord/DiscordService";
import { DiscordID } from "../../Discord/DiscordService.types";
import { GowonService } from "../../GowonService";
import { ServiceRegistry } from "../../ServicesRegistry";

export class CrownsUserService extends BaseService {
  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }
  private get discordService() {
    return ServiceRegistry.get(DiscordService);
  }
  private get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  public async canUserClaimCrowns(
    ctx: GowonContext,
    userID: DiscordID
  ): Promise<boolean> {
    return (
      await Promise.all([
        this.isCrownBanned(ctx, userID),
        this.isOptedOut(ctx, userID),
        this.isInactive(ctx, userID),
        this.isInPurgatory(ctx, userID),
      ])
    ).some((f) => !!f);
  }

  public async isCrownBanned(
    ctx: GowonContext,
    userID: DiscordID
  ): Promise<boolean> {
    this.log(
      ctx,
      `Checking if uesr ${userID} is crown banned in ${ctx.requiredGuild.id}`
    );

    return !!(await CrownBan.findOneBy({
      serverID: ctx.requiredGuild.id,
      user: { discordID: userID },
    }));
  }

  public async isOptedOut(
    ctx: GowonContext,
    userID: DiscordID
  ): Promise<boolean> {
    const setting = this.settingsService.get("optedOut", {
      guildID: ctx.requiredGuild.id,
      userID: userID,
    });

    return !!setting;
  }

  public async isInactive(
    ctx: GowonContext,
    userID: DiscordID,
    guildMember?: GuildMember
  ): Promise<boolean> {
    const member =
      guildMember || (await this.discordService.fetchGuildMember(ctx, userID));

    return userHasRole(
      member,
      await this.gowonService.getInactiveRole(ctx.requiredGuild)
    );
  }

  public async isInPurgatory(
    ctx: GowonContext,
    userID: DiscordID,
    guildMember?: GuildMember
  ): Promise<boolean> {
    const member =
      guildMember || (await this.discordService.fetchGuildMember(ctx, userID));

    return userHasRole(
      member,
      await this.gowonService.getPurgatoryRole(ctx.requiredGuild)
    );
  }
}
