import { LogicError } from "../../errors";
import { DiscordIDMention } from "../../lib/arguments/mentions/DiscordIDMention";
import { BaseCommand, Variation } from "../../lib/command/BaseCommand";
import { validators } from "../../lib/validation/validators";

const args = {
  mentions: {
    userID: { mention: new DiscordIDMention(true), index: 0 },
  },
} as const;

export default class SetPatron extends BaseCommand<typeof args> {
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
    userID: { validator: new validators.Required({}), friendlyName: "user id" },
  };

  async run() {
    const id = this.parsedArguments.userID;

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
