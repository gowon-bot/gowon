import { BaseCommand, Delegate } from "../../lib/command/BaseCommand";
import { Command } from "../../lib/command/Command";
import { Message } from "discord.js";
import { CommandManager } from "../../lib/command/CommandManager";
import { Arguments } from "../../lib/arguments/arguments";
import { AdminService } from "../../services/dbservices/AdminService";
import HelpForOneCommand from "./HelpForOneCommand";
import { LineConsolidator } from "../../lib/LineConsolidator";

interface GroupedCommands {
  [category: string]: {
    [subcategory: string]: Command[];
  };
}

const args = {
  inputs: {
    command: { index: { start: 0 } },
  },
} as const;

export default class Help extends BaseCommand<typeof args> {
  idSeed = "clc seungyeon";

  aliases = ["h"];
  description = "Displays the help menu, or help about a given command";
  usage = ["", "command"];

  arguments: Arguments = args;

  delegates: Delegate<typeof args>[] = [
    {
      when: (args) => !!args.command,
      delegateTo: HelpForOneCommand,
    },
  ];

  commandManager = new CommandManager();
  adminService = new AdminService(this.gowonClient);

  async run(message: Message) {
    await this.commandManager.init();

    let embed = await this.helpForAllCommands(message);

    if (!embed) return;

    await this.send(embed);
  }

  private async helpForAllCommands(message: Message) {
    let commands = await this.adminService.can.viewList(
      this.commandManager.list(),
      message,
      this.gowonClient
    );

    let groupedCommands = commands.reduce((acc, c) => {
      const category = c.category || "misc";
      const subcategory = c.subcategory || "";

      if (!acc[category]) acc[category] = {};
      if (!acc[category][subcategory]) acc[category][subcategory] = [];

      acc[category][subcategory].push(c);

      return acc;
    }, {} as GroupedCommands);

    const lineConsolidator = new LineConsolidator();
    lineConsolidator.addLines(
      `Run \`${this.prefix}help <command>\` to learn more about specific commands\nTo change prefix, mention Gowon (\`@Gowon prefix ?\`)\n`
    );

    for (let [categoryName, category] of Object.entries(groupedCommands)) {
      lineConsolidator.addLines(categoryName.strong());

      lineConsolidator.addLines({
        shouldDisplay: !!category[""],
        string: Object.values(category[""])
          .map((c) => c.friendlyName)
          .join(", ")
          .italic(),
      });

      delete category[""];

      for (let [subcategory, commands] of Object.entries(category)) {
        lineConsolidator.addLines(
          `${subcategory.strong()}: ${commands
            .map((c) => c.friendlyName)
            .join(", ")}`
        );
      }

      lineConsolidator.addLines(" ");
    }

    return this.newEmbed()
      .setAuthor(
        `Help for ${message.author.username}`,
        message.author.avatarURL() || ""
      )
      .setDescription(lineConsolidator.consolidate());
  }
}
