import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed, User } from "discord.js";
import { numberDisplay, ucFirst, getOrdinal } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";

export class List extends CrownsChildCommand {
  description = "Lists a user's top crowns";
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

    let [crowns, crownsCount, rank] = await Promise.all([
      this.crownsService.listTopCrowns(discordID, message.guild?.id!),
      this.crownsService.count(discordID, message.guild?.id!),
      this.crownsService.getRank(discordID, message.guild?.id!),
    ]);

    if (!rank?.count)
      throw new LogicError(
        `${ucFirst(perspective.name)} don't have any crowns in this server!`
      );

    let embed = new MessageEmbed()
      .setTitle(`${ucFirst(perspective.possessive)} crowns`)
      .setDescription(
        `${ucFirst(perspective.plusToHave)} **${numberDisplay(
          crownsCount,
          "** crown"
        )} in ${message.guild?.name} (ranked ${getOrdinal(
          rank.rank.toInt()
        ).bold()})\n\n` +
          crowns
            .map(
              (c) =>
                `${numberDisplay(c.plays, "play").bold()} - ${c.artistName}`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
