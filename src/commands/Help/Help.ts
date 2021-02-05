import { BaseCommand, Delegate } from "../../lib/command/BaseCommand";
import { Command } from "../../lib/command/Command";
import { Message } from "discord.js";
import { CommandManager } from "../../lib/command/CommandManager";
import { Arguments } from "../../lib/arguments/arguments";
import { AdminService } from "../../services/dbservices/AdminService";
import HelpForOneCommand from "./HelpForOneCommand";

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

  prefix!: string;

  async run(message: Message) {
    this.prefix = await this.gowonService.prefix(this.guild.id);
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

    interface GroupedCommands {
      [category: string]: {
        [subcategory: string]: Command[];
      };
    }

    let groupedCommands = commands.reduce((acc, c) => {
      if (!acc[c.category || "misc"]) acc[c.category || "misc"] = {};
      if (!acc[c.category || "misc"][c.subcategory || ""])
        acc[c.category || "misc"][c.subcategory || ""] = [];

      acc[c.category || "misc"][c.subcategory || ""].push(c);

      return acc;
    }, {} as GroupedCommands);

    return this.newEmbed()
      .setAuthor(
        `Help for ${message.author.username}`,
        message.author.avatarURL() || ""
      )
      .setDescription(
        `Run \`${this.prefix}help <command>\` to learn more about specific commands\nTo change prefix, mention Gowon (\`@Gowon prefix ?\`)\n\n` +
          Object.keys(groupedCommands)
            .map(
              (gc) =>
                gc.strong() +
                "\n" +
                (groupedCommands[gc][""]
                  ? Object.values(groupedCommands[gc][""])
                      .map((c) => c.friendlyName)
                      .join(", ")
                      .italic() + "\n"
                  : "") +
                Object.keys(groupedCommands[gc])
                  .filter((k) => k !== "")
                  .map(
                    (k) =>
                      "" +
                      k.strong() +
                      ": " +
                      groupedCommands[gc][k]
                        .map((c) => c.friendlyName)
                        .join(", ")
                  )
                  .join("\n")
            )
            .join("\n")
      );
  }
}
