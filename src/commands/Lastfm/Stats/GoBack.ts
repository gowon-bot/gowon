import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import {
  generateTimeRange,
  TimeRange,
  generateHumanTimeRange,
} from "../../../helpers/date";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";

export default class GoBack extends LastFMBaseCommand {
  aliases = ["gb"];
  description = "Shows what you scrobbled ";
  arguments: Arguments = {
    mentions: {
      user: { index: 0, description: "The user to lookup" },
    },
    inputs: {
      timeRange: {
        custom: (messageString: string) => generateTimeRange(messageString),
        index: -1,
      },
      humanReadableTimeRange: {
        custom: (messageString: string) =>
          generateHumanTimeRange(messageString, { raw: true, noOverall: true }),
        index: -1,
      },
    },
  };

  async run(message: Message) {
    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanTimeRange = this.parsedArguments.humanReadableTimeRange as string;

    if (!timeRange.from) throw new LogicError("Please enter a valid timeframe");

    let { username, perspective } = await this.parseMentionedUsername(message);

    let track = await this.lastFMService.goBack(username, timeRange.from!);

    let embed = new MessageEmbed()
      .setAuthor(`${humanTimeRange} ago ${perspective.name} scrobbled:`)
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
