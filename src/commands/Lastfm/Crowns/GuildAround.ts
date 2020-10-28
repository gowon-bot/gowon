import { Message, MessageEmbed } from "discord.js";
import { CrownsChildCommand } from "./CrownsChildCommand";
import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";

export class GuildAround extends CrownsChildCommand {
  aliases = ["guildme"];
  description =
    "Ranks a user based on their crown count, and shows the surrounding users";
  usage = ["", "@user"];

  arguments: Arguments = {
    mentions: {
      user: { index: 0 },
    },
  };

  async run(message: Message) {
    let { discordUser } = await this.parseMentions();

    let discordID = discordUser?.id || this.author.id;

    let guildAround = await this.crownsService.guildAround(
      message.guild!.id!,
      discordID
    );
    let author = guildAround.users.find((u) => u.discordID === discordID);

    if (!guildAround.users.length || !author)
      throw new LogicError(
        `hmmm... I couldn't find you on the crowns leaderboard!`
      );

    let embed = new MessageEmbed()
      .setAuthor(
        `${this.guild.name}'s crown leaderboard (${guildAround.start + 1} - ${
          guildAround.end
        })`
      )
      .setDescription(
        `${(
          await Promise.all(
            guildAround.users.map(
              async (u) =>
                `${u.rank}. ${u.discordID === author?.discordID ? "**" : ""}${
                  (await this.fetchUsername(u.discordID))
                }${
                  u.discordID === author?.discordID ? "**" : ""
                } with ${numberDisplay(u.count, "crown")}`
            )
          )
        ).join("\n")}
        
        Your position is #${author!.rank} with ${numberDisplay(
          author!.count,
          "crown"
        )}`
      );

    await this.send(embed);
  }
}
