import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed, User } from "discord.js";
import { numberDisplay, ucFirst } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";

export class List extends CrownsChildCommand {
  description = "Lists your top crowns";

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

    let [crowns, crownsCount] = await Promise.all([
      this.crownsService.listTopCrowns(discordID, message.guild?.id!),
      this.crownsService.count(discordID, message.guild?.id!),
    ]);

    let embed = new MessageEmbed()
      .setTitle(`${ucFirst(perspective.possessive)} crowns`)
      .setDescription(
        `${ucFirst(perspective.plusToHave)} **${numberDisplay(
          crownsCount,
          "** crown"
        )} in ${message.guild?.name}\n\n` +
          crowns
            .map(
              (c) => `${numberDisplay(c.plays, "play").bold()} - ${c.artistName}`
            )
            .join("\n")
      );

    await message.channel.send(embed);
  }
}
