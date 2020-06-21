import { Command, NoCommand } from "./BaseCommand";
import { promisify } from "util";
import _glob from "glob";
const glob = promisify(_glob);

interface Commands {
  [key: string]: () => Command;
}

async function generateCommands(): Promise<Commands> {
  let files = await glob(
    require("path").dirname(require.main?.filename) + "/commands/**/*.js"
  );

  return files.reduce((acc, file) => {
    let command = require(file).default;

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

export class CommandManager {
  commands: Commands;

  constructor(commands: Commands = {}) {
    this.commands = commands;
  }

  async init() {
    this.commands = await generateCommands();
  }

  find(commandName: string): Command {
    if (Object.keys(this.commands).includes(commandName.toLowerCase())) {
      return this.commands[commandName.toLowerCase()]();
    } else {
      for (let commandKey of Object.keys(this.commands)) {
        let command = this.commands[commandKey.toLowerCase()]();

        if (command.hasAlias(commandName)) {
          return command;
        } else if (command.children) {
          let child = command.getChild(commandName);
          if (child) return child;
        }
      }
    }
    return new NoCommand();
  }

  list(showSecret: boolean = false): Command[] {
    let commandGetterList = Object.values(this.commands).sort();

    let commandsList = commandGetterList
      .map((c) => c())
      .filter((c) => c.shouldBeIndexed);

    return showSecret
      ? commandsList
      : commandsList.filter((c) => !c.secretCommand);
  }
}
