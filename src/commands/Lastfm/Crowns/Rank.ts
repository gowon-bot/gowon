import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, User } from "discord.js";
import { numberDisplay, getOrdinal } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";

export class Rank extends CrownsChildCommand {
  aliases = ["r"];
  description = "Ranks a user based on their crown count";
  usage = ["", "@user"];

  arguments: Arguments = {
    mentions: {
      user: { index: 0 },
    },
  };

  async run(message: Message) {
    let user = this.parsedArguments.user as User;

    let discordID = user?.id || message.author.id;

    let perspective = this.usersService.discordPerspective(
      message.author,
      user
    );

    let rank = await this.crownsService.getRank(discordID, message.guild?.id!);

    if (!rank?.count?.toInt())
      throw new LogicError(
        `${perspective.plusToHave} no crowns in this server!`
      );

    let embed = this.newEmbed()
      .setAuthor(
        perspective.upper.possessive + " crowns rank",
        perspective.discordUser?.displayAvatarURL()
      )
      .setDescription(
        `${perspective.upper.possessive} ${numberDisplay(
          rank.count,
          "crown"
        ).bold()} ${rank.count.toInt() === 1 ? "ranks" : "rank"} ${
          perspective.objectPronoun
        } ${getOrdinal(rank.rank.toInt()).bold()} in ${message.guild?.name}`
      );

    await this.send(embed);
  }
}
