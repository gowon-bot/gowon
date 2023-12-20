import { HexColorString } from "discord.js";
import { uppercaseFirstLetter } from "../../../helpers/string";
import { ProfileStatsCalculator } from "../../../lib/calculators/ProfileStatsCalculator";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers/humanize";
import { EmbedView } from "../../../lib/ui/views/EmbedView";
import { Requestable } from "../../../services/LastFM/LastFMAPIService";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";
import { LastFMBaseChildCommand } from "../LastFMBaseCommand";

const args = {
  timePeriod: new TimePeriodArgument({
    description: "The time period to display stats for",
    default: "overall",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export abstract class ProfileChildCommand<
  T extends typeof args = typeof args
> extends LastFMBaseChildCommand<T> {
  parentName = "profile";
  subcategory = "profile";
  usage = ["", "time_period @user or lfm:username"];

  arguments = args as T;

  calculator!: ProfileStatsCalculator;
  requestable!: Requestable;
  username!: string;
  senderRequestable!: Requestable;
  senderUsername!: string;
  discordID?: string;
  timePeriod!: LastFMPeriod;
  humanizedPeriod!: string;

  protected readonly playsoverTiers = [
    20_000, 15_000, 10_000, 5000, 2000, 1000, 500, 250, 100, 50, 10, 1,
  ];

  async getAuthorDetails(): Promise<{
    badge: string;
    colour: string;
    image: string;
  }> {
    const image = (await this.calculator.userInfo()).images.get("large")!;

    const userType = (await this.calculator.userInfo()).type;
    const badge =
      userType !== "user"
        ? userType === "subscriber"
          ? " [Pro]"
          : ` [${uppercaseFirstLetter(userType)}]`
        : "";

    const colour =
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

  async beforeRun() {
    const {
      senderRequestable,
      senderUsername,
      requestable,
      username,
      discordUser,
      dbUser,
    } = await this.getMentions({
      fetchDiscordUser: true,
    });

    this.senderUsername = senderUsername;
    this.senderRequestable = senderRequestable;
    this.requestable = requestable;
    this.username = username;
    this.discordID = discordUser?.id;

    this.timePeriod = (this.parsedArguments as any).timePeriod as LastFMPeriod;
    this.humanizedPeriod = humanizePeriod(this.timePeriod);

    this.calculator = new ProfileStatsCalculator(
      this.ctx,
      requestable,
      this.discordID,
      dbUser.id,
      this.timePeriod
    );
  }

  protected async profileEmbed(useFooter = true): Promise<EmbedView> {
    const { badge, colour } = await this.getAuthorDetails();

    return this.authorEmbed()
      .setTitle(this.username + badge)
      .setColour(colour as HexColorString)
      .setFooter(useFooter ? this.getFooter() : "");
  }

  protected getFooter(): string {
    return this.humanizedPeriod === "overall"
      ? "Showing data from all time"
      : `Showing data ${this.humanizedPeriod}`;
  }
}
