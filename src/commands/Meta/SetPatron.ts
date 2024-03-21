import { CouldNotSetUserAsPatronError } from "../../errors/user";
import { Command, Variation } from "../../lib/command/Command";
import { DiscordUserArgument } from "../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";
import { UserStringArgument } from "../../lib/context/arguments/argumentTypes/UserStringArgument";
import { DiscordIDMention } from "../../lib/context/arguments/mentionTypes/DiscordIDMention";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { SuccessEmbed } from "../../lib/ui/embeds/SuccessEmbed";
import { validators } from "../../lib/validation/validators";

const args = {
  userID: new UserStringArgument({ mention: new DiscordIDMention() }),
  user: new DiscordUserArgument(),
} satisfies ArgumentsMap;

export default class SetPatron extends Command<typeof args> {
  idSeed = "hello venus yooyoung";

  subcategory = "developer";
  description = "Sets a user as a backer";
  aliases = ["setp", "setbacker"];
  secretCommand = true;
  devCommand = true;

  variations: Variation[] = [
    {
      name: "unset",
      variation: ["unsetpatron", "unsetp", "unsetbacker"],
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
      await this.usersService.setAsBacker(
        this.ctx,
        id!,
        !this.variationWasUsed("unset")
      );
    } catch (e) {
      throw new CouldNotSetUserAsPatronError();
    }

    const embed = new SuccessEmbed().setDescription(
      `Successfully ${
        this.variationWasUsed("unset") ? "un" : ""
      }set ${id} as a backer!`
    );

    await this.reply(embed);
  }
}
