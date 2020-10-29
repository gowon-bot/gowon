import { CrownCheck } from "../../services/dbservices/CrownsService";
import {
  User as DiscordUser,
  MessageEmbed,
  Message,
  GuildMember,
} from "discord.js";
import { numberDisplay } from "..";
import { User as DBUser } from "../../database/entity/User";
import { GowonEmbed } from ".";

export class CrownEmbeds {
  constructor(
    private crownCheck: CrownCheck,
    private user: DiscordUser,
    private message: Message,
    private plays: number,
    private member?: GuildMember
  ) {}

  private get redirect(): string {
    return this.crownCheck.redirect.redirectDisplay();
  }

  private get embed(): MessageEmbed {
    return GowonEmbed(this.member).setTitle(
      `Crown for ${this.crownCheck.artistName}${this.redirect}`
    );
  }

  newCrown(): MessageEmbed {
    return this.embed.setDescription(
      `:crown: → ${this.user.username.code()} - ${numberDisplay(
        this.crownCheck.crown!.plays,
        "play"
      )}
      
      You've created a crown for ${this.crownCheck.artistName.bold()} with ${numberDisplay(
        this.crownCheck.crown!.plays,
        "play"
      ).bold()}`
    );
  }

  updatedCrown(): MessageEmbed {
    return this.embed.setDescription(
      `You already have the crown for ${this.crownCheck.artistName.bold()}, but it's been updated from ${numberDisplay(
        this.crownCheck.oldCrown!.plays,
        "play"
      )} to ${numberDisplay(this.crownCheck.crown!.plays, "play").bold()}`
    );
  }

  async snatchedCrown(): Promise<MessageEmbed> {
    let holderUsername = (
      await DBUser.toDiscordUser(
        this.message,
        this.crownCheck.oldCrown!.user.discordID
      )
    )?.username;

    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${numberDisplay(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${holderUsername?.code()} - ${numberDisplay(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${this.crownCheck.artistName.bold()} was stolen from ${holderUsername} and is now at ${numberDisplay(
        this.crownCheck.crown!.plays,
        "play"
      ).bold()}!`
    );
  }

  async fail(): Promise<MessageEmbed> {
    let holderUsername = (
      await DBUser.toDiscordUser(
        this.message,
        this.crownCheck.oldCrown!.user.discordID
      )
    )?.username;

    let difference = this.crownCheck.crown!.plays - this.plays;

    return this.embed.setDescription(
      `
:crown: → ${holderUsername?.code()} - ${numberDisplay(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

:pensive: → ${this.user.username.code()} - ${numberDisplay(this.plays, "play")}

${holderUsername} will keep the crown for ${
        this.crownCheck.artistName
      }, leading ${this.user.username} by ${numberDisplay(difference, "play")}.
`
    );
  }

  async tooLow(threshold: number) {
    return this.embed.setDescription(
      `:pensive: → ${this.user.username.code()} - ${numberDisplay(
        this.plays,
        "play"
      )}

You must have at least ${numberDisplay(
        threshold,
        "play"
      ).bold()} to create a crown.
      `
    );
  }

  async tie(): Promise<MessageEmbed> {
    let holderUsername = (
      await DBUser.toDiscordUser(
        this.message,
        this.crownCheck.oldCrown!.user.discordID
      )
    )?.username;

    return this.embed.setDescription(
      `
:crown: → ${holderUsername?.code()} - ${numberDisplay(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

:eyes: → ${this.user.username.code()} - ${numberDisplay(this.plays, "play")}

It's a tie! ${holderUsername} will keep the crown for ${
        this.crownCheck.artistName
      }.
`
    );
  }

  async inactivity(): Promise<MessageEmbed> {
    let holderUsername = (
      await DBUser.toDiscordUser(
        this.message,
        this.crownCheck.oldCrown!.user.discordID
      )
    )?.username;

    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${numberDisplay(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${holderUsername?.code()} - ${numberDisplay(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${this.crownCheck.artistName.bold()} was stolen from ${holderUsername} due to inactivity!`
    );
  }

  async purgatory(): Promise<MessageEmbed> {
    let holderUsername = (
      await DBUser.toDiscordUser(
        this.message,
        this.crownCheck.oldCrown!.user.discordID
      )
    )?.username;

    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${numberDisplay(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${holderUsername?.code()} - ${numberDisplay(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${this.crownCheck.artistName.bold()} was stolen from ${holderUsername} due to cheating!`
    );
  }

  left(): MessageEmbed {
    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${numberDisplay(
        this.crownCheck.crown!.plays,
        "play"
      )}

:wave: → ??? - ${numberDisplay(this.crownCheck.oldCrown?.plays!, "play")}

        Yoink! The crown for ${this.crownCheck.artistName.bold()} was stolen from someone who left!`
    );
  }

  async banned(): Promise<MessageEmbed> {
    let holderUsername = (
      await DBUser.toDiscordUser(
        this.message,
        this.crownCheck.oldCrown!.user.discordID
      )
    )?.username;

    return this.embed.setDescription(
      `
:crown: → ${this.user.username.code()} - ${numberDisplay(
        this.crownCheck.crown!.plays,
        "play"
      )}

:pensive: → ${holderUsername?.code()} - ${numberDisplay(
        this.crownCheck.oldCrown?.plays!,
        "play"
      )}

        Yoink! The crown for ${this.crownCheck.artistName.bold()} was stolen from ${holderUsername} because they were crown banned!`
    );
  }
}
