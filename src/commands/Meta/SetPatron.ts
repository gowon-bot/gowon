import { LogicError } from "../../errors/errors";
import { Command, Variation } from "../../lib/command/Command";
import { DiscordUserArgument } from "../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";
import { UserStringArgument } from "../../lib/context/arguments/argumentTypes/UserStringArgument";
import { DiscordIDMention } from "../../lib/context/arguments/mentionTypes/DiscordIDMention";
import { validators } from "../../lib/validation/validators";

const args = {
  userID: new UserStringArgument({ mention: new DiscordIDMention() }),
  user: new DiscordUserArgument(),
} as const;

export default class SetPatron extends Command<typeof args> {
  idSeed = "hello venus yooyoung";

  subcategory = "developer";
  description = "Sets a user as a patron";
  aliases = ["setp"];
  secretCommand = true;
  devCommand = true;

  variations: Variation[] = [
    {
      name: "unset",
      variation: ["unsetpatron", "unsetp"],
    },
  ];

  arguments = args;

  validation = {
    userID: {
      validator: new validators.RequiredOrValidator({}),
      dependsOn: ["user"],
      friendlyName: "user id",
    },
  };

  async run() {
    const id = this.parsedArguments.user?.id || this.parsedArguments.userID;

    try {
      await this.usersService.setPatron(
        this.ctx,
        id!,
        !this.variationWasUsed("unset")
      );
    } catch (e) {
      throw new LogicError(
        `Something went wrong setting that user as a patron`
      );
    }

    const embed = this.newEmbed().setDescription(
      `Successfully ${
        this.variationWasUsed("unset") ? "un" : ""
      }set ${id} as a patron!`
    );

    await this.send(embed);
  }
}
