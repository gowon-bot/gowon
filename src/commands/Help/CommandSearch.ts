import { BaseCommand } from "../../lib/command/BaseCommand";
import { Arguments } from "../../lib/arguments/arguments";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { CommandManager } from "../../lib/command/CommandManager";
import { Command } from "../../lib/command/Command";
import { numberDisplay } from "../../helpers";
import { AdminService } from "../../services/dbservices/AdminService";

const args = {
  inputs: {
    keywords: { index: 0 },
  },
  mentions: {},
} as const;

export default class CommandSearch extends BaseCommand<typeof args> {
  idSeed = "exid solji";

  aliases = ["command"];

  description = "Search the list of commands for a keyword";

  usage = "keywords";

  arguments: Arguments = args;

  validation: Validation = {
    keywords: new validators.Required({}),
  };

  commandManager = new CommandManager();
  adminService = new AdminService(this.gowonClient, this.logger);

  async run() {
    const keywords = this.parsedArguments
      .keywords!.toLowerCase()
      .replace(/\s+/, "");

    await this.commandManager.init();

    const commandList = this.commandManager.deepList();

    const commands = await this.adminService.can.viewList(
      commandList,
      this.message,
      this.gowonClient
    );

    const foundCommands = commands.filter(this.filter(keywords));

    const embed = this.newEmbed()
      .setTitle(`Command search results for ${keywords.code()}`)
      .setDescription(
        foundCommands
          .map((c) => this.displayCommand(c, keywords))
          .slice(0, 12)
          .sort()
          .join("\n")
      )
      .setFooter(
        `Searched ${numberDisplay(
          commandList.length,
          "command"
        )}, found ${numberDisplay(foundCommands.length, "result")}` +
          (foundCommands.length > 12
            ? "\nTry narrowing down your search to see more results"
            : "")
      );

    await this.send(embed);
  }

  private filter(keywords: string): (command: Command) => boolean {
    return (command) =>
      command.name.toLowerCase().includes(keywords) ||
      !!command.aliases.find((a) => a.toLowerCase().includes(keywords)) ||
      !!command.variations
        .map((v) => v.variation)
        .flat()
        .find((v) => v.toLowerCase().includes(keywords));
  }

  private displayCommand(command: Command, keywords: string) {
    const name = command.name.replace(keywords, (match) => match.strong());

    return (command.parentName ? command.parentName + " " : "") + name;
  }
}
