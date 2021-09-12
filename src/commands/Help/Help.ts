import { BaseCommand, Delegate } from "../../lib/command/BaseCommand";
import { Command } from "../../lib/command/Command";
import { EmbedField } from "discord.js";
import { Arguments } from "../../lib/arguments/arguments";
import { AdminService } from "../../services/dbservices/AdminService";
import HelpForOneCommand from "./HelpForOneCommand";
import { ucFirst } from "../../helpers";
import { SimpleScrollingEmbed } from "../../lib/views/embeds/SimpleScrollingEmbed";
import QuickHelp from "./QuickHelp";
import { ServiceRegistry } from "../../services/ServicesRegistry";

interface GroupedCommands {
  [category: string]: Command[];
}

const args = {
  inputs: {
    all: { regex: /\b(all|commands|)\b/, index: 0 },
    command: { index: { start: 0 } },
  },
} as const;

export default class Help extends BaseCommand<typeof args> {
  idSeed = "clc seungyeon";

  aliases = ["h"];
  subcategory = "about";
  description = "Displays the help menu, or help about a given command";
  usage = ["", "all", "<command>"];

  arguments: Arguments = args;

  delegates: Delegate<typeof args>[] = [
    {
      when: (args) => !!args.command && !args.all,
      delegateTo: HelpForOneCommand,
    },
    { when: (args) => !args.all && !args.command, delegateTo: QuickHelp },
  ];

  adminService = ServiceRegistry.get(AdminService);

  async run() {
    await this.helpForAllCommands();
  }

  private async helpForAllCommands() {
    let commands = await this.adminService.can.viewList(
      this.ctx,
      this.commandRegistry.list()
    );

    const footer = (page: number, totalPages: number) =>
      `Page ${page} of ${totalPages} • Can't find a command? Try ${this.prefix}searchcommand <keywords> to search commands`;
    const description = `Run \`${this.prefix}help <command>\` to learn more about specific commands\nTo change prefix, mention Gowon (\`@Gowon prefix ?)\``;
    const embed = this.newEmbed().setAuthor(
      ...this.generateEmbedAuthor("Help")
    );

    const groupedCommands = commands.reduce((acc, command) => {
      const subcategory = command.subcategory || command.category || "misc";

      if (!acc[subcategory]) acc[subcategory] = [];

      acc[subcategory].push(command);

      return acc;
    }, {} as GroupedCommands);

    const fields = [] as EmbedField[];

    for (const [subcategory, commands] of Object.entries(groupedCommands)) {
      fields.push({
        name: ucFirst(subcategory),
        value: commands.map((c) => c.friendlyName.code()).join(", "),
        inline: true,
      });
    }

    const simpleScrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: fields,
        pageSize: 9,
      },
      { customFooter: footer, embedDescription: description }
    );

    simpleScrollingEmbed.send();
  }
}
