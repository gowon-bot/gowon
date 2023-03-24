import { User as DiscordUser } from "discord.js";
import { ILike } from "typeorm";
import { Crown, InvalidCrownState } from "../../../database/entity/Crown";
import { ArtistIsCrownBannedError } from "../../../errors/crowns";
import { sqlLikeEscape } from "../../../helpers/database";
import { constants } from "../../../lib/constants";
import { GowonContext } from "../../../lib/context/Context";
import { BaseService } from "../../BaseService";
import { GowonService } from "../../GowonService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { RedirectsService } from "../RedirectsService";
import {
  CrownCheck,
  CrownCheckOptions,
  Fail,
  InvalidCrownCheck,
  New,
  Tie,
  TooLow,
  Updated,
  Yoinked,
} from "./CrownCheck";
import { CrownOptions } from "./CrownsService.types";

export class CrownsCheckService extends BaseService {
  protected get redirectsService() {
    return ServiceRegistry.get(RedirectsService);
  }
  protected get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  public getThreshold(): number {
    return constants.crownThreshold;
  }

  public async check(
    ctx: GowonContext,
    options: CrownOptions
  ): Promise<CrownCheck> {
    this.log(
      ctx,
      `Checking crown for user ${options.senderDBUser.id} and artist ${options.artistName}`
    );

    const redirect = await this.redirectsService.getRedirect(
      ctx,
      options.artistName
    );
    const redirectedArtistName = redirect.to || redirect.from;

    if (
      await this.gowonService.isArtistCrownBanned(
        ctx.requiredGuild,
        redirectedArtistName
      )
    ) {
      throw new ArtistIsCrownBannedError(redirectedArtistName);
    }

    const crown = await this.getCrown(ctx, redirectedArtistName, {
      showDeleted: true,
      noRedirect: true,
    });

    if (redirect.to && crown) {
      crown.redirectedFrom = redirect.from;
    }

    const redirectedOptions: CrownCheckOptions = {
      ...options,
      artistName: redirectedArtistName,
      crown: crown!,
      redirect,
      previousCrown: crown?.asPreviousCrownData()!,
      threshold: this.getThreshold(),
    };

    if (!crown || crown.deletedAt) {
      return await this.handleNewCrown(ctx, redirectedOptions);
    } else {
      return await this.handleExistingCrown(
        ctx,
        redirectedOptions as CrownCheckOptions
      );
    }
  }

  public async getCrown(
    ctx: GowonContext,
    artistName: string,
    options: {
      refresh?: boolean;
      requester?: DiscordUser;
      showDeleted?: boolean;
      noRedirect?: boolean;
      caseSensitive?: boolean;
    } = { refresh: false, showDeleted: true, noRedirect: false }
  ): Promise<Crown | undefined> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, `Fetching crown for ${artistName} in ${serverID}`);

    let crownArtistName = artistName;
    let redirectedFrom: string | undefined = undefined;

    if (!options.noRedirect) {
      let redirect = await this.redirectsService.getRedirect(ctx, artistName);

      if (redirect?.to) {
        redirectedFrom = redirect.from;
        crownArtistName = redirect.to || redirect.from;
      }
    }

    let crown = await Crown.findOne({
      where: {
        artistName: options.caseSensitive
          ? crownArtistName
          : ILike(sqlLikeEscape(crownArtistName)),
        serverID,
      },
      withDeleted: options.showDeleted,
    });

    if (crown) crown.redirectedFrom = redirectedFrom;

    return options.refresh
      ? await crown?.refresh({
          onlyIfOwnerIs: options.requester?.id,
          logger: ctx.logger,
        })
      : crown ?? undefined;
  }

  protected async handleNewCrown(
    ctx: GowonContext,
    options: CrownCheckOptions
  ): Promise<CrownCheck> {
    if (options.plays < this.getThreshold()) {
      return new TooLow(options);
    }

    this.log(
      ctx,
      "Creating crown for " +
        options.artistName +
        " in server " +
        ctx.requiredGuild.id
    );

    const newCrown = options.crown?.deletedAt
      ? await options.crown.undelete(options)
      : await Crown.createNew(ctx, options, options.redirect);

    return new New({ ...options, crown: newCrown });
  }

  protected async handleExistingCrown(
    ctx: GowonContext,
    options: CrownCheckOptions & { crown: Crown }
  ): Promise<CrownCheck> {
    const invalidCheck = await options.crown.invalid(ctx);

    if (invalidCheck.failed && invalidCheck.reason) {
      return await this.handleInvalidHolder(
        options,
        invalidCheck.reason as InvalidCrownState
      );
    }

    if (options.crown.user.id === options.senderDBUser.id) {
      return await this.handleSelfCrown(options);
    } else {
      const crown = await options.crown.refresh({ logger: ctx.logger });

      return await this.handleCrownCheck({ ...options, crown });
    }
  }

  private async handleInvalidHolder(
    options: CrownCheckOptions,
    reason: InvalidCrownState
  ): Promise<CrownCheck> {
    if (options.plays < this.getThreshold()) {
      return new Fail(options);
    }

    options.crown.user = options.senderDBUser;
    options.crown.plays = options.plays;

    await options.crown.save();

    return new InvalidCrownCheck(reason, options);
  }

  private async handleSelfCrown(
    options: CrownCheckOptions
  ): Promise<CrownCheck> {
    if (
      options.crown.plays === options.plays ||
      options.plays < this.getThreshold()
    ) {
      return new Updated(options);
    } else {
      options.crown.plays = options.plays;
      await options.crown.save();

      return new Updated({ ...options });
    }
  }

  private async handleCrownCheck(
    options: CrownCheckOptions
  ): Promise<CrownCheck> {
    if (options.plays < this.getThreshold()) {
      return new TooLow(options);
    }

    if (options.plays > options.crown.plays) {
      options.crown.user = options.senderDBUser;
      options.crown.plays = options.plays;
      options.crown.version++;
      options.crown.lastStolen = new Date();

      await options.crown.save();

      return new Yoinked(options);
    }

    if (options.plays < options.crown.plays) {
      return new Fail(options);
    }

    if (options.crown.plays === options.plays) {
      return new Tie(options);
    }

    return new Fail(options);
  }
}
