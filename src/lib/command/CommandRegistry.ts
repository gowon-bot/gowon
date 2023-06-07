import { Commands } from "./CommandGroup";
import { CommandExtractor } from "./extractor/CommandExtractor";

import _glob from "glob";
import { promisify } from "util";
import { flatDeep } from "../../helpers";
import { SimpleMap } from "../../helpers/types";
import { Command } from "./Command";
import { ExtractedCommand } from "./extractor/ExtractedCommand";
const glob = promisify(_glob);

type Registry = Array<Command>;
type CommandFactory = SimpleMap<{
  command: { new (): Command };
  parentID?: string;
}>;

export class CommandRegistry {
  private constructor() {}

  private static instance: CommandRegistry;

  public static getInstance(): CommandRegistry {
    if (!this.instance) this.instance = new CommandRegistry();

    return this.instance;
  }

  private pool: Registry = [];
  private factory: CommandFactory = {};

  public init(commands: Commands) {
    this.pool = [];

    for (const command of Object.values(commands)) {
      const instance = new command();

      if (instance.archived || !instance.shouldBeIndexed) {
        continue;
      }

      if (instance.hasChildren) {
        instance.children!.commandClasses.forEach((c) => {
          const childInstance = new c.command();

          if (!childInstance.archived) this.factory[childInstance.id] = c;
        });
      }

      this.factory[instance.id] = { command };

      this.pool.push(instance);
    }
  }

  public make(commandID: string) {
    const commandFactory = this.factory[commandID];

    const command = new commandFactory.command();

    command.parentID = commandFactory.parentID;

    return command;
  }

  async find(
    messageString: string,
    guildID?: string,
    commands?: Command[]
  ): Promise<ExtractedCommand | undefined> {
    const extractor = new CommandExtractor();

    return await extractor.extract(
      messageString,
      guildID,
      commands || this.list(true)
    );
  }

  findByID(
    id: string,
    {
      includeSecret,
      includeArchived,
    }: { includeSecret?: boolean; includeArchived?: boolean } = {}
  ): Command | undefined {
    return this.deepList(includeSecret, includeArchived).find(
      (c) => c.id === id
    );
  }

  list(showSecret: boolean = false, showArchived = false): Command[] {
    return this.pool.filter(
      (c) =>
        (c.parentName ? true : c.shouldBeIndexed) &&
        (showSecret || !c.secretCommand) &&
        (showArchived || !c.archived)
    );
  }

  deepList(showSecret = false, showArchived = false): Command[] {
    const shallowCommands = this.list();

    return flatDeep<Command>(
      shallowCommands.map((sc) =>
        sc.hasChildren ? [sc, ...(sc.children?.asDeepList() || [])] : sc
      )
    ).filter(
      (c) => (showSecret || !c.secretCommand) && (showArchived || !c.archived)
    );
  }

  search(commands: Command[], keywords?: string): Command[] {
    if (!keywords) {
      return commands.sort((a, b) =>
        a.friendlyName.localeCompare(b.friendlyName)
      );
    }

    const filteredCommands = commands
      .filter((command) => this.compareCommandAndKeywords(command, keywords))
      .sort((a, b) => a.friendlyName.localeCompare(b.friendlyName));

    const exactMatch = filteredCommands.filter(
      (c) =>
        (c.friendlyNameWithParent || c.name).toLowerCase() ===
          keywords.toLowerCase() ||
        c.aliases.find((a) => a.toLowerCase() === keywords.toLowerCase()) ||
        checkPrefixes(c, keywords, true)
    );

    if (exactMatch.length) {
      return [
        ...exactMatch,
        ...filteredCommands.filter(
          (c) => !exactMatch.some((m) => c.id === m.id)
        ),
      ];
    }

    return filteredCommands;
  }

  private compareCommandAndKeywords(command: Command, keywords: string) {
    keywords = keywords.toLowerCase();

    const inName = (command.friendlyNameWithParent || command.name)
      .toLowerCase()
      .includes(keywords);
    const inAliases = command.aliases.find((a) => a.includes(keywords));
    const inVariations = flatDeep(
      command.variations.map((v) => [v.variation, v.name])
    ).find((v) => v.includes(keywords));
    const inPrefixes = checkPrefixes(command, keywords);
    const inMetadata =
      command.category?.includes(keywords) ||
      command.subcategory?.includes(keywords);

    return inName || inAliases || inVariations || inPrefixes || inMetadata;
  }
}

export async function generateCommands(): Promise<Commands> {
  const files = await glob(
    require("path").dirname(require.main?.filename) + "/commands/**/*.js"
  );

  return files.reduce((acc, file) => {
    const command = require(file).default;

    if (command?.constructor) {
      const commandNameSplit = file.split("/");

      const commandName = commandNameSplit[commandNameSplit.length - 1]
        .slice(0, -3)
        .toLowerCase();

      acc[commandName] = command;
    }

    return acc;
  }, {} as Commands);
}

function checkPrefixes(
  command: Command & { prefixes?: string | string[] },
  keywords: string,
  exact = false
): boolean {
  if (command.hasChildren && command.prefixes) {
    const prefixes =
      command.prefixes instanceof Array ? command.prefixes : [command.prefixes];

    return prefixes.some((p) =>
      exact
        ? p.toLowerCase() === keywords.toLowerCase()
        : p.toLowerCase().includes(keywords.toLowerCase())
    );
  }

  return false;
}
