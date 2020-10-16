import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message, MessageEmbed } from "discord.js";
import { numberDisplay, ago } from "../../../helpers";
import { User } from "../../../database/entity/User";
import { CrownState } from "../../../services/dbservices/CrownsService";

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

    let { senderUsername, senderUser } = await this.parseMentions({
      usernameRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let artistDetails = await this.lastFMService.artistInfo(
      senderUsername
        ? {
            artist,
            username: senderUsername,
          }
        : { artist }
    );

    let crown = await this.crownsService.getCrown(
      artistDetails.name,
      message.guild?.id!
    );

    if (!crown) {
      await this.reply(`No one has the crown for ${artistDetails.name.bold()}`);
      return;
    }

    let invalidCheck = await crown?.invalid(message);

    let invalidBadge =
      invalidCheck.reason === CrownState.inactivity
        ? " [Inactive]"
        : invalidCheck.reason === CrownState.left
        ? " [Left the server]"
        : invalidCheck.reason === CrownState.purgatory
        ? " [Purgatory]"
        : invalidCheck.reason === CrownState.banned
        ? " [Crown banned]"
        : "";

    if (crown.user.id === senderUser?.id && artistDetails.stats.userplaycount) {
      crown.plays = artistDetails.stats.userplaycount.toInt();
      crown.save();
    } else if (crown.user.lastFMUsername) {
      await crown.refresh({ logger: this.logger });
    }

    if (crown.user.id) {
      let holderUser = await User.toDiscordUser(message, crown.user.discordID);

      let holderUsername = holderUser?.username;

      let embed = new MessageEmbed()
        .setTitle(
          `Who has ${crown.artistName.bold()}?` + crown.redirectDisplay()
        )
        .setDescription(
          `${
            holderUsername || "???"
          }${invalidBadge} has the crown for ${crown.artistName.bold()} with ${numberDisplay(
            crown.plays,
            "play"
          )}

          Created ${ago(crown.createdAt)}${
            crown.version > 1 ? ". Last stolen " + ago(crown.lastStolen) : ""
          }

          _It ${
            crown.version === 0
              ? "has never been stolen"
              : "has been stolen " + numberDisplay(crown.version, "time")
          }_`
        );

      await this.send(embed);
    }
  }
}
