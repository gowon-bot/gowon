import { Chance } from "chance";
import { EmbedBuilder } from "discord.js";
import { ArtistRedirect } from "../../../database/entity/ArtistRedirect";
import { Crown } from "../../../database/entity/Crown";
import {
  bold,
  mentionGuildMember,
  strikethrough,
} from "../../../helpers/discord";
import { GowonContext } from "../../../lib/context/Context";
import { Emoji } from "../../../lib/emoji/Emoji";
import { displayNumber } from "../../../lib/views/displays";
import {
  CrownOptions,
  CrownState,
  InvalidCrownState,
} from "./CrownsService.types";

export type CrownCheckOptions = CrownOptions & {
  redirect: ArtistRedirect;
  threshold: number;
  crown: Crown;
  previousCrown: PreviousCrownData;
};

export interface PreviousCrownData {
  plays: number;
  ownerDiscordID: string;
}

export abstract class CrownCheck {
  constructor(protected options: CrownCheckOptions) {}

  public readonly displayName: string = this.constructor.name;
  public abstract state: CrownState;

  public asEmbed(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    const newEmbed = embed.setTitle(
      `Crown for ${
        this.options.artistName
      }${this.options.redirect.redirectDisplay()}`
    );

    return this.buildEmbed(ctx, newEmbed);
  }

  public getOptions(): CrownCheckOptions {
    return this.options;
  }

  public shouldRecordHistory(): boolean {
    return (
      this.options.crown &&
      !(
        this.state === CrownState.updated &&
        this.options.crown.plays === this.options.previousCrown.plays
      )
    );
  }

  protected abstract buildEmbed(
    ctx: GowonContext,
    embed: EmbedBuilder
  ): EmbedBuilder;
}

export class TooLow extends CrownCheck {
  displayName = "Too low";
  state = CrownState.tooLow;

  protected buildEmbed(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    return embed.setDescription(
      `:pensive: → ${mentionGuildMember(ctx.author.id)} - ${displayNumber(
        this.options.plays,
        "play"
      )}
  
  You must have at least ${bold(
    displayNumber(this.options.threshold, "play")
  )} to create a crown.
        `
    );
  }
}

export class New extends CrownCheck {
  displayName = "New";
  state = CrownState.newCrown;

  protected buildEmbed(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    return embed.setDescription(
      `:crown: → ${mentionGuildMember(ctx.author.id)} - ${displayNumber(
        this.options.crown.plays,
        "play"
      )}
      
      You've created a crown for ${bold(this.options.artistName)} with ${bold(
        displayNumber(this.options.crown.plays, "play")
      )}`
    );
  }
}

export class Yoinked extends CrownCheck {
  displayName = "Yoinked";
  state = CrownState.snatched;

  protected buildEmbed(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    const yoinkEmoji = Chance().weighted([Emoji.yoink, Emoji.yoimk], [100, 1]);

    return embed.setDescription(
      `${yoinkEmoji} → ${mentionGuildMember(ctx.author.id)} - ${displayNumber(
        this.options.crown.plays,
        "play"
      )}

😔 → ${mentionGuildMember(
        this.options.previousCrown.ownerDiscordID
      )} - ${displayNumber(this.options.previousCrown.plays, "play")}

        Yoink! The crown for ${bold(
          this.options.artistName
        )} was stolen and is now at ${bold(
        displayNumber(this.options.crown.plays, "play")
      )}!`
    );
  }
}

export class Fail extends CrownCheck {
  state = CrownState.fail;

  protected buildEmbed(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    const difference = this.options.crown.plays - this.options.plays;

    const crownEmoji =
      this.options.plays > this.options.previousCrown.plays
        ? Emoji.baited
        : "👑";

    return embed.setDescription(
      `
${crownEmoji} → ${mentionGuildMember(
        this.options.crown.user.discordID
      )} - ${displayNumber(this.options.crown.plays, "play")}

${difference >= 5000 ? Emoji.wail : "😔"} → ${mentionGuildMember(
        ctx.author.id
      )} - ${displayNumber(this.options.plays, "play")}

      You are ${displayNumber(
        difference,
        "play"
      )} away from being able to claim it.`
    );
  }
}

export class Tie extends CrownCheck {
  state = CrownState.tie;

  protected buildEmbed(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    return embed.setDescription(
      `
:crown: → ${mentionGuildMember(
        this.options.crown.user.discordID
      )} - ${displayNumber(this.options.crown.plays, "play")}

:eyes: → ${mentionGuildMember(ctx.author.id)} - ${displayNumber(
        this.options.plays,
        "play"
      )}

It's a tie! The owner will keep the crown for ${this.options.artistName}.
`
    );
  }
}

export class Updated extends CrownCheck {
  state = CrownState.updated;

  protected buildEmbed(_ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    return embed.setDescription(
      `You already have the crown for ${bold(
        this.options.artistName
      )}, but it's been updated from ${displayNumber(
        this.options.previousCrown.plays,
        "play"
      )} to ${bold(displayNumber(this.options.crown.plays, "play"))}`
    );
  }
}

export class InvalidCrownCheck extends CrownCheck {
  displayName = "Yoinked";
  state = this.reason;

  constructor(private reason: InvalidCrownState, options: CrownCheckOptions) {
    super(options);
  }

  protected buildEmbed(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    switch (this.reason) {
      case CrownState.inactivity:
        return this.inactivity(ctx, embed);
      case CrownState.purgatory:
        return this.purgatory(ctx, embed);
      case CrownState.left:
        return this.left(ctx, embed);
      case CrownState.banned:
        return this.banned(ctx, embed);
      case CrownState.loggedOut:
        return this.loggedOut(ctx, embed);
    }
  }

  private inactivity(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    return embed.setDescription(
      `
${Emoji.yoink} → ${mentionGuildMember(ctx.author.id)} - ${displayNumber(
        this.options.crown.plays,
        "play"
      )}

🫥 → ${mentionGuildMember(
        this.options.previousCrown.ownerDiscordID
      )} - ${displayNumber(this.options.previousCrown.plays, "play")}

        Yoink! The crown for ${bold(
          this.options.artistName
        )} was stolen due to inactivity!`
    );
  }

  private purgatory(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    return embed.setDescription(
      `
${Emoji.yoink} → ${mentionGuildMember(ctx.author.id)} - ${displayNumber(
        this.options.crown.plays,
        "play"
      )}

:pensive: → ${mentionGuildMember(
        this.options.previousCrown.ownerDiscordID
      )} - ${displayNumber(this.options.previousCrown.plays, "play")}

        Yoink! The crown for ${bold(
          this.options.artistName
        )} was stolen because the owner is in scrobble purgatory!`
    );
  }

  private left(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    return embed.setDescription(
      `
${Emoji.yoink} → ${mentionGuildMember(ctx.author.id)} - ${displayNumber(
        this.options.crown.plays,
        "play"
      )}

:wave: → ??? - ${displayNumber(this.options.previousCrown.plays, "play")}

        Yoink! The crown for ${bold(
          this.options.artistName
        )} was stolen from someone who left!`
    );
  }

  private banned(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    return embed.setDescription(
      `
${Emoji.yoink} → ${mentionGuildMember(ctx.author.id)} - ${displayNumber(
        this.options.crown.plays,
        "play"
      )}

:pensive: → ${mentionGuildMember(
        this.options.previousCrown.ownerDiscordID
      )} - ${displayNumber(this.options.previousCrown.plays, "play")}

        Yoink! The crown for ${bold(
          this.options.artistName
        )} was stolen from its owner because they were crown banned!`
    );
  }

  private loggedOut(ctx: GowonContext, embed: EmbedBuilder): EmbedBuilder {
    return embed.setDescription(
      `
:crown: → ${mentionGuildMember(ctx.author.id)} - ${displayNumber(
        this.options.crown.plays,
        "play"
      )}

:pensive: → ??? - ${strikethrough(
        displayNumber(this.options.previousCrown.plays, "play")
      )}

        Yoink! The crown for ${bold(
          this.options.artistName
        )} was stolen from its owner because they were logged out!`
    );
  }
}
