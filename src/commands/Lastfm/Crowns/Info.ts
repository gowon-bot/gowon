import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message, MessageEmbed } from "discord.js";
import { numberDisplay, ago } from "../../../helpers";
import { User } from "../../../database/entity/User";
import { userHasRole } from "../../../helpers/discord";

export class Info extends CrownsChildCommand {
  aliases = ["wh"];
  description = "Shows information about a crown";
  usage = ["", "artist"];

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let user = await this.usersService.getUser(
      message.author.id!,
      message.guild?.id!
    );
    let username = user.lastFMUsername;

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(username)).artist;
    }

    let artistDetails = await this.lastFMService.artistInfo(artist, username);

    let crown = await this.crownsService.getCrown(
      artistDetails.name,
      message.guild?.id!,
      { refresh: false }
    );

    if (crown && crown.user.id === user.id) {
      crown.plays = artistDetails.stats.userplaycount.toInt();
      crown.save();
    } else {
      await crown?.refresh();
    }

    if (!crown)
      await message.reply(
        `No one has the crown for ${artistDetails.name.bold()}`
      );

    if (crown?.user.id) {
      let holderUser = await User.toDiscordUser(message, crown.user.discordID);

      let holderUsername = holderUser?.username;
      let member = await message.guild?.members.fetch(holderUser?.id!);
      let isInactive = userHasRole(
        member!,
        await this.botMomentService.getInactiveRole(message.guild!)
      );

      let embed = new MessageEmbed()
        .setTitle(`Who has ${artistDetails.name.bold()}?`)
        .setDescription(
          `${holderUsername}${
            isInactive ? " _[INACTIVE]_" : ""
          } has the crown for ${artistDetails.name.bold()} with ${numberDisplay(
            crown.plays,
            "play"
          )}

          Created ${ago(crown.createdAt)}${
            crown.version > 1 ? ". Last stolen " + ago(crown.lastStolen) : ""
          }

          _It ${
            crown.version === 1
              ? "has never been stolen"
              : "has been stolen " + numberDisplay(crown.version - 1, "time")
          }_`
        );

      await message.channel.send(embed);
    }
  }
}
