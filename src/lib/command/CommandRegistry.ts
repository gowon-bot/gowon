import { Commands } from "./CommandGroup";

import { promisify } from "util";
import _glob from "glob";
import { Command } from "./Command";
import { AliasChecker } from "../AliasChecker";
import { RunAs } from "./RunAs";
import { flatDeep } from "../../helpers";
import { ParentCommand } from "./ParentCommand";
const glob = promisify(_glob);

type Registry = Array<Command>;

export class CommandRegistry {
  private constructor() {}

  private static instance: CommandRegistry;

  public static getInstance(): CommandRegistry {
    if (!this.instance) this.instance = new CommandRegistry();

    return this.instance;
  }

  private pool: Registry = [];

  public async init() {
    const commands = await generateCommands();

    for (const command of Object.values(commands)) {
      this.pool.push(new command());
    }
  }

  async find(
    messageString: string,
    serverID: string,
    commands?: Command[]
  ): Promise<{ command?: Command; runAs: RunAs }> {
    let checker = new AliasChecker(messageString);

    for (let command of commands || this.list(true)) {
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
  ): Promise<{ command?: Command; runAs: RunAs }> {
    const { command, runAs } = await this.find(messageString, serverID);

    return { runAs, command: command?.copy() };
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
    let shallowCommands = this.list();

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

    let filteredCommands = commands
      .filter(
        (command) =>
          (command.friendlyNameWithParent || command.name)
            .toLowerCase()
            .includes(keywords) ||
          !!command.aliases.find((a) => a.toLowerCase().includes(keywords)) ||
          !!flatDeep(command.variations.map((v) => [v.variation, v.name])).find(
            (v) => v.toLowerCase().includes(keywords)
          ) ||
          checkPrefixes(command, keywords)
      )
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
}

async function generateCommands(): Promise<Commands> {
  const files = await glob(
    require("path").dirname(require.main?.filename) + "/commands/**/*.js"
  );

  return files.reduce((acc, file) => {
    const command = require(file).default;

    if (command?.constructor) {
      let commandNameSplit = file.split("/");

      let commandName = commandNameSplit[commandNameSplit.length - 1]
        .slice(0, -3)
        .toLowerCase();

      acc[commandName] = command;
    }

    return acc;
  }, {} as Commands);
}

function checkPrefixes(
  command: Command,
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
