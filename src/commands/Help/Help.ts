import { EmbedField } from "discord.js";
import { code } from "../../helpers/discord";
import { uppercaseFirst } from "../../helpers/native/string";
import { bullet } from "../../helpers/specialCharacters";
import { Command, CommandRedirect } from "../../lib/command/Command";
import { Flag } from "../../lib/context/arguments/argumentTypes/Flag";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { PermissionsService } from "../../lib/permissions/PermissionsService";
import { SimpleScrollingEmbed } from "../../lib/views/embeds/SimpleScrollingEmbed";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import HelpForOneCommand from "./HelpForOneCommand";
import QuickHelp from "./QuickHelp";

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
} satisfies ArgumentsMap;

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

  permissionsService = ServiceRegistry.get(PermissionsService);

  async run() {
    await this.helpForAllCommands();
  }

  private async helpForAllCommands() {
    const rawCommands = this.commandRegistry.list({
      includeOnlyDMCommands: this.ctx.isDM(),
    });

    const canChecks = await this.permissionsService.canListInContext(
      this.ctx,
      rawCommands
    );

    const commands = canChecks.filter((c) => c.allowed).map((cc) => cc.command);

    const footer = (page: number, totalPages: number) =>
      `Page ${page} of ${totalPages} ${bullet} Can't find a command? Try ${this.prefix}searchcommand <keywords> to search commands`;
    const description = `Run \`${this.prefix}help <command>\` to learn more about specific commands\nTo change prefix, mention Gowon (\`@Gowon prefix ?)\``;
    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor(this.ctx.isDM() ? "Help in DMs" : "Help")
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
        name: uppercaseFirst(subcategory),
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
