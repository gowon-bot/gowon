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
  static commands: Commands = {};

  private constructor() {}

  static async init() {
    this.commands = await generateCommands();
  }

  static find(commandName: string): Command {
    console.log(this.commands);

    if (Object.keys(this.commands).includes(commandName.toLowerCase())) {
      return this.commands[commandName.toLowerCase()]();
    } else {
      for (let commandKey of Object.keys(this.commands)) {
        let command = this.commands[commandKey.toLowerCase()]();

        if (command.hasAlias(commandName)) {
          return command;
        }
      }
    }
    return new NoCommand();
  }
  static list(showSecret: boolean): Command[] {
    let commandsList = Object.values(this.commands).sort();

    return showSecret
      ? commandsList.map((c) => c())
      : commandsList.map((c) => c()).filter((c) => !c.secretCommand);
  }
}
