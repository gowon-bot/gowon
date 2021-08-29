import { Command } from "./Command";
import { AliasChecker } from "../AliasChecker";
import { flatDeep } from "../../helpers";
import { RunAs } from "./RunAs";

import { promisify } from "util";
import _glob from "glob";
import { ParentCommand } from "./ParentCommand";
const glob = promisify(_glob);

interface Commands {
  [key: string]: () => Command;
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

      acc[commandName] = () => new command();
    }

    return acc;
  }, {} as Commands);
}

export class CommandRegistry {
  isInitialized = false;

  constructor(public commands: Commands = {}) {}

  async init() {
    this.commands = await generateCommands();
    this.isInitialized = true;
  }

  async find(
    messageString: string,
    serverID: string
  ): Promise<{ command?: Command; runAs: RunAs }> {
    let checker = new AliasChecker(messageString);

    for (let command of this.list(true)) {
      if (await checker.check(command, serverID)) {
        let runAs = await checker.getRunAs(command, serverID);
        return {
          command: runAs.last()?.command!,
          runAs,
        };
      }
    }
    return { runAs: new RunAs() };
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
    let commandGetterList = Object.values(this.commands);

    let commandsList = commandGetterList
      .map((c) => {
        return c();
      })
      .filter((c) => (c.parentName ? true : c.shouldBeIndexed));

    return commandsList.filter(
      (c) => (showSecret || !c.secretCommand) && (showArchived || !c.archived)
    );
  }

  deepList(showSecret = false, showArchived = false): Command[] {
    let shallowCommands = this.list();

    return flatDeep<Command>(
      shallowCommands.map((sc) =>
        sc.hasChildren
          ? [sc, ...(sc.children?.deepList(showSecret, showArchived) || [])]
          : sc
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
