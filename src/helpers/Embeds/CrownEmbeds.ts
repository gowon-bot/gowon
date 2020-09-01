import { CrownCheck } from "../../services/dbservices/CrownsService";
import { User as DiscordUser, MessageEmbed, Message } from "discord.js";
import { numberDisplay } from "..";
import { User as DBUser } from "../../database/entity/User";

export class CrownEmbeds {
  constructor(
    private crownCheck: CrownCheck,
    private user: DiscordUser,
    private message: Message,
    private plays: number
  ) {}

  newCrown(): MessageEmbed {
    return new MessageEmbed()
      .setTitle(`Crown for ${this.crownCheck.crown!.artistName}`)
      .setDescription(
        `:crown: → ${this.user.username.code()} - ${numberDisplay(
          this.crownCheck.crown!.plays,
          "play"
        )}
      
      You've created a crown for ${this.crownCheck.crown!.artistName.bold()} with ${numberDisplay(
          this.crownCheck.crown!.plays,
          "play"
        ).bold()}`
      );
  }

  updatedCrown(): MessageEmbed {
    return new MessageEmbed()
      .setTitle(`Crown for ${this.crownCheck.crown!.artistName}`)
      .setDescription(
        `You already have the crown for ${this.crownCheck.crown!.artistName.bold()}, but it's been updated from ${numberDisplay(
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

    return new MessageEmbed()
      .setTitle(`Crown for ${this.crownCheck.crown!.artistName}`)
      .setDescription(
        `
:crown: → ${this.user.username.code()} - ${numberDisplay(
          this.crownCheck.crown!.plays,
          "play"
        )}

:pensive: → ${holderUsername?.code()} - ${numberDisplay(
          this.crownCheck.oldCrown?.plays!,
          "play"
        )}

        Yoink! The crown for ${this.crownCheck.crown!.artistName.bold()} was stolen from ${holderUsername} and is now at ${numberDisplay(
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

    return new MessageEmbed()
      .setTitle(`Crown for ${this.crownCheck.crown!.artistName}`)
      .setDescription(
        `
:crown: → ${holderUsername?.code()} - ${numberDisplay(
          this.crownCheck.oldCrown?.plays!,
          "play"
        )}

:pensive: → ${this.user.username.code()} - ${numberDisplay(this.plays, "play")}

${holderUsername} will keep the crown for ${
          this.crownCheck.crown!.artistName
        }, leading ${this.user.username} by ${numberDisplay(
          difference,
          "play"
        )}.
`
      );
  }

  async tooLow(artistName: string, threshold: number) {
    return new MessageEmbed()
      .setTitle(`Crown for ${artistName}`)
      .setDescription(
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

    return new MessageEmbed()
      .setTitle(`Crown for ${this.crownCheck.crown!.artistName}`)
      .setDescription(
        `
:crown: → ${holderUsername?.code()} - ${numberDisplay(
          this.crownCheck.oldCrown?.plays!,
          "play"
        )}

:eyes: → ${this.user.username.code()} - ${numberDisplay(this.plays, "play")}

It's a tie! ${holderUsername} will keep the crown for ${
          this.crownCheck.crown!.artistName
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

    return new MessageEmbed()
      .setTitle(`Crown for ${this.crownCheck.crown!.artistName}`)
      .setDescription(
        `
:crown: → ${this.user.username.code()} - ${numberDisplay(
          this.crownCheck.crown!.plays,
          "play"
        )}

:pensive: → ${holderUsername?.code()} - ${numberDisplay(
          this.crownCheck.oldCrown?.plays!,
          "play"
        )}

        Yoink! The crown for ${this.crownCheck.crown!.artistName.bold()} was stolen from ${holderUsername} due to inactivity!`
      );
  }

  async purgatory(): Promise<MessageEmbed> {
    let holderUsername = (
      await DBUser.toDiscordUser(
        this.message,
        this.crownCheck.oldCrown!.user.discordID
      )
    )?.username;

    return new MessageEmbed()
      .setTitle(`Crown for ${this.crownCheck.crown!.artistName}`)
      .setDescription(
        `
:crown: → ${this.user.username.code()} - ${numberDisplay(
          this.crownCheck.crown!.plays,
          "play"
        )}

:pensive: → ${holderUsername?.code()} - ${numberDisplay(
          this.crownCheck.oldCrown?.plays!,
          "play"
        )}

        Yoink! The crown for ${this.crownCheck.crown!.artistName.bold()} was stolen from ${holderUsername} due to cheating!`
      );
  }

  left(): MessageEmbed {
    return new MessageEmbed()
      .setTitle(`Crown for ${this.crownCheck.crown!.artistName}`)
      .setDescription(
        `
:crown: → ${this.user.username.code()} - ${numberDisplay(
          this.crownCheck.crown!.plays,
          "play"
        )}

:wave: → ??? - ${numberDisplay(this.crownCheck.oldCrown?.plays!, "play")}

        Yoink! The crown for ${this.crownCheck.crown!.artistName.bold()} was stolen from someone who left!`
      );
  }

  async banned(): Promise<MessageEmbed> {
    let holderUsername = (
      await DBUser.toDiscordUser(
        this.message,
        this.crownCheck.oldCrown!.user.discordID
      )
    )?.username;

    return new MessageEmbed()
      .setTitle(`Crown for ${this.crownCheck.crown!.artistName}`)
      .setDescription(
        `
:crown: → ${this.user.username.code()} - ${numberDisplay(
          this.crownCheck.crown!.plays,
          "play"
        )}

:pensive: → ${holderUsername?.code()} - ${numberDisplay(
          this.crownCheck.oldCrown?.plays!,
          "play"
        )}

        Yoink! The crown for ${this.crownCheck.crown!.artistName.bold()} was stolen from ${holderUsername} because they were crown banned!`
      );
  }
}
