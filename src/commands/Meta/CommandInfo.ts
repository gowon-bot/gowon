import { CommandNotFoundError } from "../../errors/errors";
import { italic } from "../../helpers/discord";
import { emDash } from "../../helpers/specialCharacters";
import { Command } from "../../lib/command/Command";
import { Flag } from "../../lib/context/arguments/argumentTypes/Flag";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { displayNumber } from "../../lib/views/displays";
import { MetaBaseCommand } from "./MetaBaseCommand";

const args = {
  searchString: new StringArgument({ index: { start: 0 }, required: true }),
  byID: new Flag({
    description: "Use searchString as an ID",
    longnames: ["byID"],
  }),
} satisfies ArgumentsMap;

export default class CommandInfo extends MetaBaseCommand<typeof args> {
  idSeed = "iz*one hyewon";

  arguments = args;

  validation: Validation = {
    searchString: {
      validator: new validators.RequiredValidator({}),
      friendlyName: "search string",
    },
  };

  devCommand = true;
  description = "Displays some info about a command";

  async run() {
    const searchString = this.parsedArguments.searchString;

    let command: Command | undefined;

    if (this.parsedArguments.byID) {
      command = this.commandRegistry.findByID(
        this.parsedArguments.searchString
      );
    } else {
      const foundCommand = await this.commandRegistry.find(
        searchString,
        this.requiredGuild.id
      );

      command = foundCommand?.command;
    }

    if (!command) throw new CommandNotFoundError();

    const count = await this.metaService.countCommandRuns(this.ctx, command.id);

    const embed = this.newEmbed().setTitle(
      `Info about ${command.friendlyNameWithParent}`
    ).setDescription(`
      **Name**: ${command.name}${command.parentName ? `\n**Parent**: ${command.parentName}` : ""
      }
      **ID**: ${command.idSeed} ${emDash} ${italic(command.id)}${command.hasChildren
        ? `\n**Number of children**: ${command.children?.commands?.length || 0}`
        : ""
      }
    **Category**: ${command.category || "(no category)"}${command.subcategory ? ` > ${command.subcategory}` : ""
      }
    
    Run ${displayNumber(count, "time")}`);

    await this.send(embed);
  }
}
