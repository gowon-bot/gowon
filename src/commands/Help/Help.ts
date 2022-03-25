import { Command, CommandRedirect } from "../../lib/command/Command";
import { EmbedField } from "discord.js";
import { AdminService } from "../../services/dbservices/AdminService";
import HelpForOneCommand from "./HelpForOneCommand";
import { ucFirst } from "../../helpers";
import { SimpleScrollingEmbed } from "../../lib/views/embeds/SimpleScrollingEmbed";
import QuickHelp from "./QuickHelp";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { Flag } from "../../lib/context/arguments/argumentTypes/Flag";
import { code } from "../../helpers/discord";

interface GroupedCommands {
  [category: string]: Command[];
}

const args = {
  inputAll: new StringArgument({
    match: ["all", "commands"],
    slashCommandOption: false,
  }),
  all: new Flag({
    longnames: ["all", "commands"],
    shortnames: ["a"],
    description: "Show a list of all the commands",
  }),
  command: new StringArgument({
    index: { start: 0 },
    description: "A command to view help for",
  }),
} as const;

export default class Help extends Command<typeof args> {
  idSeed = "clc seungyeon";

  aliases = ["h"];
  subcategory = "about";
  description = "Displays the help menu, or help about a given command";
  usage = ["", "all", "<command>"];

  arguments = args;
  slashCommand = true;

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => !!args.command && !args.inputAll && !args.all,
      redirectTo: HelpForOneCommand,
    },
    {
      when: (args) => !args.inputAll && !args.command && !args.all,
      redirectTo: QuickHelp,
    },
  ];

  adminService = ServiceRegistry.get(AdminService);

  customContext = {
    constants: { adminService: this.adminService },
  };

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
    const embed = this.newEmbed().setAuthor(this.generateEmbedAuthor("Help"));

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
        value: commands.map((c) => code(c.friendlyName)).join(", "),
        inline: true,
      });
    }

    const simpleScrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: fields,
      pageSize: 9,
      overrides: { customFooter: footer, embedDescription: description },
    });

    simpleScrollingEmbed.send();
  }
}
