import { MessageEmbed } from "discord.js";
import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { RedirectsChildCommand } from "./RedirectsChildCommand";

export class Add extends RedirectsChildCommand {
  description = "Add a redirect";
  aliases = ["set"];
  usage = ["redirectFrom | redirectTo"];

  arguments: Arguments = {
    inputs: {
      from: { index: 0, splitOn: "|" },
      to: { index: 1, splitOn: "|" },
    },
  };

  validation: Validation = {
    from: {
      validator: new validators.RequiredAnd({
        message: "Please specify both which artist to redirect from, and which to redirect to!",
      }),
      dependsOn: ["to"],
    },
  };

  async run() {
    let from = this.parsedArguments.from as string,
      to = this.parsedArguments.to as string;

    let [fromCorrected, toCorrected] = await Promise.all([
      this.lastFMService.correctArtist({ artist: from }),
      this.lastFMService.correctArtist({ artist: to }),
    ]);

    if (fromCorrected === toCorrected)
      throw new LogicError("You can't redirect an artist to itself!");

    this.message.react("✅");

    let isValid = await this.lastFMService.validateRedirect(
      fromCorrected,
      toCorrected
    );

    if (!isValid)
      throw new LogicError(
        `hmmm, it looks like ${fromCorrected.bold()} doesn't redirect to ${toCorrected.bold()}`
      );

    let redirect = await this.redirectsService.setRedirect(
      fromCorrected,
      toCorrected
    );

    let embed = new MessageEmbed()
      .setTitle(`New redirect`)
      .setDescription(
        `Set ${redirect.from.bold()} to redirect to ${redirect.to.bold()}`
      );

    await this.send(embed);
  }
}
