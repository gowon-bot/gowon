import { Chance } from "chance";
import {
  Client,
  User as DiscordUser,
  GuildMember,
  MessageEmbed,
} from "discord.js";
import { gowonEmbed } from ".";
import { bold, code } from "../../../helpers/discord";
import { CrownCheck } from "../../../services/dbservices/CrownsService";
import { Emoji } from "../../Emoji";
import { GowonClient } from "../../GowonClient";
import { GowonContext } from "../../context/Context";
import { displayNumber } from "../displays";

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
      `:crown: → ${code(this.user.username)} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}
      
      You've created a crown for ${bold(
        this.crownCheck.artistName
      )} with ${bold(displayNumber(this.crownCheck.crown!.plays, "play"))}`
    );
  }

  updatedCrown(): MessageEmbed {
    return this.embed.setDescription(
      `You already have the crown for ${bold(
        this.crownCheck.artistName
      )}, but it's been updated from ${displayNumber(
        this.crownCheck.oldCrown!.plays,
        "play"
      )} to ${bold(displayNumber(this.crownCheck.crown!.plays, "play"))}`
    );
  }

  async snatchedCrown(): Promise<MessageEmbed> {
    const holderUsername = await this.holderUsername();
    const yoinkEmoji = Chance().weighted([Emoji.yoink, Emoji.yoimk], [100, 1]);

    return this.embed.setDescription(
      `
${yoinkEmoji} → ${code(this.user.username)} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${code(holderUsername)} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${bold(
          this.crownCheck.artistName
        )} was stolen from ${holderUsername} and is now at ${bold(
        displayNumber(this.crownCheck.crown!.plays, "play")
      )}!`
    );
  }

  async fail(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    let difference = this.crownCheck.crown!.plays - this.plays;

    return this.embed.setDescription(
      `
:crown: → ${code(holderUsername)} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

${difference >= 5000 ? Emoji.wail : ":pensive:"} → ${code(
        this.user.username
      )} - ${displayNumber(this.plays, "play")}

${holderUsername} will keep the crown for ${
        this.crownCheck.artistName
      }, leading ${this.user.username} by ${displayNumber(difference, "play")}.
`
    );
  }

  async tooLow(threshold: number) {
    return this.embed.setDescription(
      `:pensive: → ${code(this.user.username)} - ${displayNumber(
        this.plays,
        "play"
      )}

You must have at least ${bold(
        displayNumber(threshold, "play")
      )} to create a crown.
      `
    );
  }

  async tie(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    return this.embed.setDescription(
      `
:crown: → ${code(holderUsername)} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

:eyes: → ${code(this.user.username)} - ${displayNumber(this.plays, "play")}

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
:crown: → ${code(this.user.username)} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${code(holderUsername)} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${bold(
          this.crownCheck.artistName
        )} was stolen from ${holderUsername} due to inactivity!`
    );
  }

  async purgatory(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    return this.embed.setDescription(
      `
:crown: → ${code(this.user.username)} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${code(holderUsername)} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${bold(
          this.crownCheck.artistName
        )} was stolen from ${holderUsername} due to cheating!`
    );
  }

  left(): MessageEmbed {
    return this.embed.setDescription(
      `
:crown: → ${code(this.user.username)} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:wave: → ??? - ${displayNumber(this.crownCheck.oldCrown?.plays!, "play")}

        Yoink! The crown for ${bold(
          this.crownCheck.artistName
        )} was stolen from someone who left!`
    );
  }

  async banned(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    return this.embed.setDescription(
      `
:crown: → ${code(this.user.username)} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${code(holderUsername)} - ${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${bold(
          this.crownCheck.artistName
        )} was stolen from ${holderUsername} because they were crown banned!`
    );
  }

  async loggedOut(): Promise<MessageEmbed> {
    let holderUsername = await this.holderUsername();

    return this.embed.setDescription(
      `
:crown: → ${code(this.user.username)} - ${displayNumber(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${code(holderUsername)} - ~~${displayNumber(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}~~

        Yoink! The crown for ${bold(
          this.crownCheck.artistName
        )} was stolen from ${holderUsername} because they were logged out!`
    );
  }
}
