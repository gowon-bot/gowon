import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed, User } from "discord.js";
import { numberDisplay, chunkArray } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";

export class DM extends CrownsChildCommand {
  description = "DMs you a users crowns";
  usage = ["", "@user"];

  arguments: Arguments = {
    mentions: {
      user: { index: 0 },
    },
  };

  async run(message: Message) {
    const crownsPerMessage = 40;

    let user = this.parsedArguments.user as User;

    let discordID = user?.id || message.author.id;

    let perspective = this.usersService.discordPerspective(
      message.author,
      user
    );

    let [crowns, crownsCount] = await Promise.all([
      this.crownsService.listTopCrowns(discordID, message.guild?.id!, -1),
      this.crownsService.count(discordID, message.guild?.id!),
    ]);

    this.reply(`sending you a list of ${perspective.possessive} crowns...`);

    let chunks = chunkArray(crowns, crownsPerMessage);

    message.author.send(
      `${perspective.upper.plusToHave} ${numberDisplay(
        crownsCount,
        "crown"
      )} in ${message.guild?.name}`
    );

    chunks
      .map((chunk, chunkIdx) =>
        new MessageEmbed()
          .setTitle(
            `Crowns ${chunkIdx * crownsPerMessage + 1} - ${
              (chunkIdx + 1) * crownsPerMessage < crowns.length
                ? (chunkIdx + 1) * crownsPerMessage
                : crowns.length
            }`
          )
          .setDescription(
            chunk.map(
              (c, i) =>
                `${chunkIdx * crownsPerMessage + 1 + i}) ${
                  c.artistName
                } ― ${numberDisplay(c.plays, "play").bold()}`
            )
          )
      )
      .forEach((e) => message.author.send(e));
  }
}
