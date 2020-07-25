import { LastFMBaseChildCommand } from "../LastFMBaseCommand";
import { OverviewStatsCalculator } from "../../../lib/OverviewStatsCalculator";
import { Message, User } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { ucFirst } from "../../../helpers";

export abstract class OverviewChildCommand extends LastFMBaseChildCommand {
  parentName = "overview";

  calculator!: OverviewStatsCalculator;

  arguments: Arguments = {
    mentions: {
      user: { index: 0 },
    },
  };

  async getAuthorDetails(): Promise<{
    badge: string;
    colour: string;
    image: string;
  }> {
    let image = (await this.calculator.userInfo()).image.find(
      (i) => i.size === "large"
    )?.["#text"]!;

    let userType = (await this.calculator.userInfo()).type;
    let badge =
      userType !== "user"
        ? userType === "subscriber"
          ? " [Pro]"
          : ` [${ucFirst(userType)}]`
        : "";

    let colour =
      userType === "mod"
        ? "#fb9904"
        : userType === "staff"
        ? "#b90100"
        : userType === "subscriber"
        ? "black"
        : "#ffffff";

    return { colour, badge, image };
  }

  async prerun(message: Message) {
    let user = (this.parsedArguments.user as User) || message.author;

    let username = await this.usersService.getUsername(user.id, message.guild?.id!);

    this.calculator = new OverviewStatsCalculator(
      username,
      user.id,
      message.guild?.id!,
      this.logger
    );
  }
}
