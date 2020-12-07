import { CommandNotFoundError } from "../../errors";
import { numberDisplay } from "../../helpers";
import { Arguments } from "../../lib/arguments/arguments";
import { CommandManager } from "../../lib/command/CommandManager";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { MetaBaseCommand } from "./MetaBaseCommand";

export default class CommandInfo extends MetaBaseCommand {
  idSeed = "iz*one hyewon";

  arguments: Arguments = {
    inputs: {
      searchString: {
        index: { start: 0 },
      },
    },
  };

  validation: Validation = {
    searchString: {
      validator: new validators.Required({}),
      friendlyName: "search string",
    },
  };

  secretCommand = true;
  devCommand = true;
  description = "Displays some info about a command";

  commandManager = new CommandManager();

  async run() {
    let searchString = this.parsedArguments.searchString as string;

    await this.commandManager.init();

    const { command, runAs } = await this.commandManager.find(
      searchString,
      this.guild.id
    );

    if (!command) throw new CommandNotFoundError();

    const count = await this.metaService.countCommandRuns(command.id);

    let embed = this.newEmbed().setTitle(
      `Info about ${runAs.toCommandFriendlyName()}`
    ).setDescription(`
      **Name**: ${command.name}
      **Id**: ${command.idSeed} — ${command.id.italic()}${
      command.hasChildren
        ? `\n**Number of children**: ${command.children?.list().length || 0}`
        : ""
    }
    **Category**: ${command.category}${
      command.subcategory ? ` > ${command.subcategory}` : ""
    }
    
    Run ${numberDisplay(count, "time")}
      
    `);

    await this.send(embed);
  }
}
