import { Commands } from "./CommandGroup";

import { promisify } from "util";
import _glob from "glob";
import { AliasChecker } from "../AliasChecker";
import { RunAs } from "./RunAs";
import { flatDeep } from "../../helpers";
import { ParentCommand } from "./ParentCommand";
import { SimpleMap } from "../../helpers/types";
import { BaseCommand } from "./BaseCommand";
const glob = promisify(_glob);

type Registry = Array<BaseCommand>;
type CommandFactory = SimpleMap<{ new (): BaseCommand }>;

export class CommandRegistry {
  private constructor() {}

  private static instance: CommandRegistry;

  public static getInstance(): CommandRegistry {
    if (!this.instance) this.instance = new CommandRegistry();

    return this.instance;
  }

  private pool: Registry = [];
  private factory: CommandFactory = {};

  public async init() {
    const commands = await generateCommands();

    this.pool = [];

    for (const command of Object.values(commands)) {
      const instance = new command();

      if (instance.archived || !instance.shouldBeIndexed) {
        continue;
      }

      if (instance.hasChildren) {
        instance.children!.commandClasses.forEach((c) => {
          const childInstance = new c();

          if (!childInstance.archived) this.factory[childInstance.id] = c;
        });
      }

      this.factory[instance.id] = command;

      this.pool.push(instance);
    }
  }

  public make(commandID: string) {
    return new this.factory[commandID]();
  }

  async find(
    messageString: string,
    serverID: string,
    commands?: BaseCommand[]
  ): Promise<{ command?: BaseCommand<any>; runAs: RunAs }> {
    const checker = new AliasChecker(messageString);

    for (const command of commands || this.list(true)) {
      if (await checker.check(command, serverID)) {
        const runAs = await checker.getRunAs(command, serverID);

        return {
          command: runAs.last()?.command!,
          runAs,
        };
      }
    }
    return { runAs: new RunAs() };
  }

  async findAndCopy(
    messageString: string,
    serverID: string
  ): Promise<{ command?: BaseCommand; runAs: RunAs }> {
    const { command, runAs } = await this.find(messageString, serverID);

    return { runAs, command: command?.copy() };
  }

  findByID(
    id: string,
    {
      includeSecret,
      includeArchived,
    }: { includeSecret?: boolean; includeArchived?: boolean } = {}
  ): BaseCommand | undefined {
    return this.deepList(includeSecret, includeArchived).find(
      (c) => c.id === id
    );
  }

  list(showSecret: boolean = false, showArchived = false): BaseCommand[] {
    return this.pool.filter(
      (c) =>
        (c.parentName ? true : c.shouldBeIndexed) &&
        (showSecret || !c.secretCommand) &&
        (showArchived || !c.archived)
    );
  }

  deepList(showSecret = false, showArchived = false): BaseCommand[] {
    const shallowCommands = this.list();

    return flatDeep<BaseCommand>(
      shallowCommands.map((sc) =>
        sc.hasChildren ? [sc, ...(sc.children?.asDeepList() || [])] : sc
      )
    ).filter(
      (c) => (showSecret || !c.secretCommand) && (showArchived || !c.archived)
    );
  }

  search(commands: BaseCommand[], keywords?: string): BaseCommand[] {
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

  private compareCommandAndKeywords(command: BaseCommand, keywords: string) {
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

async function generateCommands(): Promise<Commands> {
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
  command: BaseCommand,
  keywords: string,
  exact = false
): boolean {
  if (command instanceof ParentCommand && command.prefixes) {
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
