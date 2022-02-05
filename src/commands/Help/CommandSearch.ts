import { BaseCommand } from "../../lib/command/BaseCommand";
import { Arguments } from "../../lib/arguments/arguments";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { Command } from "../../lib/command/Command";
import { AdminService } from "../../services/dbservices/AdminService";
import { displayNumber } from "../../lib/views/displays";
import { ServiceRegistry } from "../../services/ServicesRegistry";

const args = {
  inputs: {
    keywords: { index: 0 },
  },
  mentions: {},
} as const;

export default class CommandSearch extends BaseCommand<typeof args> {
  idSeed = "exid solji";

  aliases = ["command", "searchcommands", "searchcommand", "sc"];
  subcategory = "about";
  description = "Search the list of commands for a keyword";

  usage = "keywords";

  arguments: Arguments = args;

  validation: Validation = {
    keywords: new validators.Required({}),
  };

  adminService = ServiceRegistry.get(AdminService);

  ctx = this.generateContext({
    constants: { adminService: this.adminService },
  });

  async run() {
    const keywords = this.parsedArguments
      .keywords!.toLowerCase()
      .replace(/\s+/, "");

    const commandList = this.commandRegistry.deepList();

    const commands = await this.adminService.can.viewList(
      this.ctx,
      commandList
    );

    const foundCommands = this.commandRegistry.search(commands, keywords);

    const embed = this.newEmbed()
      .setTitle(`Command search results for ${keywords.code()}`)
      .setDescription(
        foundCommands
          .map((c) => this.displayCommand(c, keywords))
          .slice(0, 12)
          .sort()
          .join("\n")
      )
      .setFooter({
        text:
          `Searched ${displayNumber(
            commandList.length,
            "command"
          )}, found ${displayNumber(foundCommands.length, "result")}` +
          (foundCommands.length > 12
            ? "\nTry narrowing down your search to see more results, or go to https://gowon.ca/commands"
            : ""),
      });

    await this.send(embed);
  }

  private displayCommand(command: Command, keywords: string) {
    const name = command.friendlyName.replace(keywords, (match) =>
      match.strong()
    );

    return (command.parentName ? command.parentName + " " : "") + name;
  }
}
