import { CrownCheck } from "../../../services/dbservices/CrownsService";
import {
  User as DiscordUser,
  MessageEmbed,
  GuildMember,
  Client,
} from "discord.js";
import { gowonEmbed } from ".";
import { Emoji } from "../../Emoji";
import { GowonClient } from "../../GowonClient";
import { displayNumber } from "../displays";
import { GowonContext } from "../../context/Context";

export class CrownEmbeds {
  client: Client;

  constructor(
    private ctx: GowonContext,
    private crownCheck: CrownCheck,
    private user: DiscordUser,
    private gowonClient: GowonClient,
    private plays: number,
    private member?: GuildMember
  ) {
    this.client = gowonClient.client;
  }

  private get redirect(): string {
    return this.crownCheck.redirect.redirectDisplay();
  }

  private async holderUsername(): Promise<string> {
    return await this.gowonClient.userDisplay(
      this.ctx,
      this.crownCheck.oldCrown!.user.discordID
    );
  }

  private get embed(): MessageEmbed {
    return gowonEmbed(this.member).setTitle(
      `Crown for ${this.crownCheck.artistName}${this.redirect}`
    );
  }

  newCrown(): MessageEmbed {
    return this.embed.setDescription(
      `:crown: → ${this.user.username.code()} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}
      
      You've created a crown for ${this.crownCheck.artistName.strong()} with ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      ).strong()}`
    );
  }

  updatedCrown(): MessageEmbed {
    return this.embed.setDescription(
      `You already have the crown for ${this.crownCheck.artistName.strong()}, but it's been updated from ${displayNumber(
        this.crownCheck.oldCrown!.plays,
        "play"
      )} to ${displayNumber(this.crownCheck.crown!.plays, "play").strong()}`
    );
  }

  async snatchedCrown(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${holderUsername?.code()} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${this.crownCheck.artistName.strong()} was stolen from ${holderUsername} and is now at ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      ).strong()}!`
    );
  }

  async fail(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    let difference = this.crownCheck.crown!.plays - this.plays;

    return this.embed.setDescription(
      `
:crown: → ${holderUsername?.code()} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

${
  difference >= 5000 ? Emoji.wail : ":pensive:"
} → ${this.user.username.code()} - ${displayNumber(this.plays, "play")}

${holderUsername} will keep the crown for ${
        this.crownCheck.artistName
      }, leading ${this.user.username} by ${displayNumber(difference, "play")}.
`
    );
  }

  async tooLow(threshold: number) {
    return this.embed.setDescription(
      `:pensive: → ${this.user.username.code()} - ${displayNumber(
        this.plays,
        "play"
      )}

You must have at least ${displayNumber(
        threshold,
        "play"
      ).strong()} to create a crown.
      `
    );
  }

  async tie(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    return this.embed.setDescription(
      `
:crown: → ${holderUsername?.code()} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

:eyes: → ${this.user.username.code()} - ${displayNumber(this.plays, "play")}

It's a tie! ${holderUsername} will keep the crown for ${
        this.crownCheck.artistName
      }.
`
    );
  }

  async inactivity(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${holderUsername?.code()} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${this.crownCheck.artistName.strong()} was stolen from ${holderUsername} due to inactivity!`
    );
  }

  async purgatory(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${holderUsername?.code()} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${this.crownCheck.artistName.strong()} was stolen from ${holderUsername} due to cheating!`
    );
  }

  left(): MessageEmbed {
    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:wave: → ??? - ${displayNumber(this.crownCheck.oldCrown?.plays!, "play")}

        Yoink! The crown for ${this.crownCheck.artistName.strong()} was stolen from someone who left!`
    );
  }

  async banned(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${holderUsername?.code()} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${this.crownCheck.artistName.strong()} was stolen from ${holderUsername} because they were crown banned!`
    );
  }

  async loggedOut(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${holderUsername?.code()} - ~~${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}~~

        Yoink! The crown for ${this.crownCheck.artistName.strong()} was stolen from ${holderUsername} because they were logged out!`
    );
  }
}
