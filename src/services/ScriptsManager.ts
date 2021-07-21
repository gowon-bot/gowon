import { promisify } from "util";
import _glob from "glob";
import { LogicError } from "../errors";
import { BaseCommand } from "../lib/command/BaseCommand";
const glob = promisify(_glob);

type Script = (command: BaseCommand) => void;

interface Scripts {
  [key: string]: Script;
}

async function generateScripts(): Promise<Scripts> {
  const files = await glob(
    require("path").dirname(require.main?.filename) + "/scripts/**/*.js"
  );

  return files.reduce((acc, file) => {
    const script = require(file).default;

    let scriptNameSplit = file.split("/");

    let scriptName = scriptNameSplit[scriptNameSplit.length - 1]
      .slice(0, -3)
      .toLowerCase();

    acc[scriptName] = script;

    return acc;
  }, {} as Scripts);
}

export class ScriptsManager {
  isInitialized = false;

  scripts = {} as Scripts;

  constructor() {}

  async init() {
    this.scripts = await generateScripts();
    this.isInitialized = true;
  }

  public runScript(scriptName: string, asCommand: BaseCommand) {
    const script = this.scripts[scriptName.toLowerCase()] as Script | undefined;

    if (script) {
      script(asCommand);
    } else {
      throw new LogicError(`Script ${scriptName.code()} not found!`);
    }
  }
}
