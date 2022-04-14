import { promisify } from "util";
import _glob from "glob";
import { LogicError } from "../errors/errors";
import { SimpleMap } from "../helpers/types";
import { code } from "../helpers/discord";
import { GowonContext } from "../lib/context/Context";
const glob = promisify(_glob);

type Script = (ctx: GowonContext) => void;
type Scripts = SimpleMap<Script>;

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

export class ScriptsRegistry {
  isInitialized = false;

  scripts = {} as Scripts;

  constructor() {}

  async init() {
    this.scripts = await generateScripts();
    this.isInitialized = true;
  }

  public runScript(scriptName: string, ctx: GowonContext) {
    const script = this.scripts[scriptName.toLowerCase()] as Script | undefined;

    if (script) {
      script(ctx);
    } else {
      throw new LogicError(`Script ${code(scriptName)} not found!`);
    }
  }
}
