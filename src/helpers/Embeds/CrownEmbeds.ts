import { CrownCheck } from "../../services/dbservices/CrownsService";
import { User as DiscordUser, MessageEmbed, Message } from "discord.js";
import { numberDisplay } from "..";

export class CrownEmbeds {
  private constructor() {}

  static newCrown(crownCheck: CrownCheck, user: DiscordUser): MessageEmbed {
    return new MessageEmbed()
      .setTitle(`New crown for ${user.username}`)
      .setColor("#008000")
      .setDescription(
        `${user.username} has created a crown for **${
          crownCheck.crown.artistName
        }** with **${numberDisplay(crownCheck.crown.plays, "play")}**`
      );
  }

  static updatedCrown(crownCheck: CrownCheck, user: DiscordUser): MessageEmbed {
    return new MessageEmbed()
      .setTitle(`Updated crown for ${user.username}`)
      .setColor("#008000")
      .setDescription(
        `You already have the crown **${
          crownCheck.crown.artistName
        }**, but it's been updated from ${numberDisplay(
          crownCheck.oldCrown!.plays,
          "play"
        )} to **${numberDisplay(crownCheck.crown.plays, "play")}**`
      );
  }

  static async snatchedCrown(
    crownCheck: CrownCheck,
    user: DiscordUser,
    message: Message
  ): Promise<MessageEmbed> {
    let crownHolder = await message.guild?.members.fetch(
      crownCheck.oldCrown!.user.discordID
    )!;
    let holderUsername = crownHolder.user.username;

    return new MessageEmbed()
      .setTitle("Yoink")
      .setColor("#008000")
      .setDescription(
        `The crown for **${
          crownCheck.crown.artistName
        }** was stolen from ${holderUsername} and is now at **${numberDisplay(
          crownCheck.crown.plays,
          "play"
        )}**! (from ${numberDisplay(crownCheck.oldCrown!.plays, "play")})`
      );
  }
}
