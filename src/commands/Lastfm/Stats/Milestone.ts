import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { getOrdinal, ucFirst } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Milestone extends LastFMBaseCommand {
  aliases = ["mls"];
  description = "Shows you what you scrobbled at a certain milestone";
  subcategory = "library stats"
  usage = ["", "milestone @user"]

  arguments: Arguments = {
    inputs: {
      milestone: {
        regex: /[0-9]{1,8}/,
        index: 0,
      },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  async run(message: Message) {
    let milestone = this.parsedArguments.milestone as number;

    let { username, perspective } = await this.parseMentionedUsername(message, {
      asCode: false,
    });

    let track = await this.lastFMService.getMilestone(username, milestone);

    let embed = new MessageEmbed()
      .setAuthor(
        `${ucFirst(perspective.possessive)} ${getOrdinal(milestone)} track was:`
      )
      .setTitle(track.name)
      .setDescription(
        `by ${track.artist["#text"].bold()}` +
          (track.album["#text"] ? ` from ${track.album["#text"].italic()}` : "")
      )
      .setThumbnail(
        track.image.find((i) => i.size === "large")?.["#text"] || ""
      );

    await message.channel.send(embed);
  }
}
