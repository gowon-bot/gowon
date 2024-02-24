import { bold, code } from "../../helpers/discord";
import { LineConsolidator } from "../../lib/LineConsolidator";
import { Command } from "../../lib/command/Command";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { PermissionsService } from "../../lib/permissions/PermissionsService";
import { displayNumber } from "../../lib/ui/displays";
import { HelpEmbed } from "../../lib/ui/embeds/HelpEmbed";
import { ServiceRegistry } from "../../services/ServicesRegistry";

const args = {
  keywords: new StringArgument({
    required: { customMessage: "Please enter some keywords!" },
    description: "The keywords to search with",
  }),
} satisfies ArgumentsMap;

export default class SearchCommands extends Command<typeof args> {
  idSeed = "exid solji";

  aliases = ["command", "commandsearch", "searchcommand", "sc"];
  subcategory = "about";
  description = "Search the list of commands";

  usage = "keywords";
  slashCommand = true;

  arguments = args;

  permissionsService = ServiceRegistry.get(PermissionsService);

  async run() {
    const keywords = this.parsedArguments
      .keywords!.toLowerCase()
      .replace(/\s+/, "");

    const commandList = this.commandRegistry.deepList();

    const canChecks = await this.permissionsService.canListInContext(
      this.ctx,
      commandList
    );

    const commands = canChecks.filter((c) => c.allowed).map((cc) => cc.command);

    const foundCommands = this.commandRegistry.search(commands, keywords);

    const embed = new HelpEmbed()
      .setHeader(`Search results for ${code(keywords)}`)
      .setDescription(
        new LineConsolidator().addLines(
          ...foundCommands
            .map((c) => this.displayCommand(c, keywords))
            .slice(0, 12)
            .sort()
        )
      )
      .setFooter(
        `Searched ${displayNumber(
          commandList.length,
          "command"
        )}, found ${displayNumber(foundCommands.length, "result")}` +
          (foundCommands.length > 12
            ? "\nTry narrowing down your search to see more results, or go to https://gowon.bot/commands"
            : "")
      );

    await this.reply(embed);
  }

  private displayCommand(command: Command, keywords: string) {
    const name = command.friendlyName.replace(keywords, (match) => bold(match));

    return (command.parentName ? command.parentName + " " : "") + name;
  }
}
