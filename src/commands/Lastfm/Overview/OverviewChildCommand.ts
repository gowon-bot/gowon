import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { OverviewStatsCalculator } from "../../../lib/calculators/OverviewStatsCalculator";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { ucFirst } from "../../../helpers";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { Requestable } from "../../../services/LastFM/LastFMAPIService";
import { generateHumanPeriod, generatePeriod } from "../../../helpers/date";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";

export const overviewInputs = {
  timePeriod: {
    custom: (messageString: string) => generatePeriod(messageString, "overall"),
    index: -1,
  },
  humanReadableTimePeriod: {
    custom: (messageString: string) =>
      generateHumanPeriod(messageString, "overall"),
    index: -1,
  },
} as const;

export abstract class OverviewChildCommand<
  T extends Arguments = Arguments
> extends LastFMBaseChildCommand<T> {
  parentName = "overview";
  subcategory = "overview";
  usage = ["", "time_period @user or lfm:username"];

  arguments: Arguments = {
    inputs: overviewInputs,
    mentions: standardMentions,
  };

  calculator!: OverviewStatsCalculator;
  requestable!: Requestable;
  username!: string;
  senderRequestable!: Requestable;
  senderUsername!: string;
  discordID?: string;
  timePeriod!: LastFMPeriod;
  humanReadableTimePeriod!: string;

  protected readonly playsoverTiers = [
    20_000, 15_000, 10_000, 5000, 2000, 1000, 500, 250, 100, 50, 10, 1,
  ];

  async getAuthorDetails(): Promise<{
    badge: string;
    colour: string;
    image: string;
  }> {
    let image = (await this.calculator.userInfo()).images.get("large")!;

    let userType = (await this.calculator.userInfo()).type;
    let badge =
      userType !== "user"
        ? userType === "subscriber"
          ? " [Pro]"
          : ` [${ucFirst(userType)}]`
        : "";

    let colour =
      userType === "alum"
        ? "#9804fe"
        : userType === "mod"
        ? "#fb9904"
        : userType === "staff"
        ? "#b90100"
        : userType === "subscriber"
        ? "black"
        : "#ffffff";

    return { colour, badge, image };
  }

  async prerun(message: Message) {
    let {
      senderRequestable,
      senderUsername,
      requestable,
      username,
      discordUser,
    } = await this.parseMentions({
      fetchDiscordUser: true,
    });

    this.senderUsername = senderUsername;
    this.senderRequestable = senderRequestable;
    this.requestable = requestable;
    this.username = username;
    this.discordID = discordUser?.id;

    this.timePeriod = (this.parsedArguments as any).timePeriod as LastFMPeriod;
    this.humanReadableTimePeriod = (
      this.parsedArguments as any
    ).humanReadableTimePeriod;

    this.calculator = new OverviewStatsCalculator(
      requestable,
      message.guild?.id!,
      this.discordID,
      this.timePeriod,
      this.logger
    );
  }

  protected async overviewEmbed(useFooter = true): Promise<MessageEmbed> {
    let { badge, colour, image } = await this.getAuthorDetails();

    return this.newEmbed()
      .setAuthor(this.username + badge, image)
      .setColor(colour)
      .setFooter(useFooter ? this.getFooter() : "");
  }

  protected getFooter(): string {
    return this.humanReadableTimePeriod === "overall"
      ? "Showing data from all time"
      : `Showing data ${this.humanReadableTimePeriod}`;
  }
}
