import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message, MessageEmbed } from "discord.js";
import { CrownEmbeds } from "../../../helpers/Embeds/CrownEmbeds";
import { numberDisplay, ago } from "../../../helpers";

export class Info extends CrownsChildCommand {
  aliases = ["wh"];
  description = "Shows information about a crown";

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let { username } = await this.parseMentionedUsername(message);

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(username)).artist;
    }

    let artistDetails = await this.lastFMService.artistInfo(artist, username);

    let crown = await this.crownsService.getCrown(artistDetails.name);

    if (!crown) {
      await message.reply(`No one has the crown for **${artistDetails.name}**`);
    } else {
      let holderUsername = await CrownEmbeds.getUsernameOfGuildMember(
        message,
        crown.user.discordID
      );

      let embed = new MessageEmbed()
        .setTitle(`Who has **${artistDetails.name}**?`)
        .setDescription(
          `${holderUsername} has the crown for **${
            artistDetails.name
          }** with ${numberDisplay(crown.plays, "play")}

          Created ${ago(crown.createdAt)}${
            crown.version > 1
              ? ". Last stolen" + ago(crown.updatedAt)
              : ""
          }

          _It ${
            crown.version === 1
              ? "has never been stolen"
              : "has been stolen " + numberDisplay(crown.version, "time")
          }_`
        );

      await message.channel.send(embed);
    }
  }
}
