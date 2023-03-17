import { Logger, SilentLogger } from "../../lib/Logger";
import { Command } from "../../lib/command/Command";
import { MockContext } from "../MockContext";

export abstract class MockCommand extends Command {
  idSeed = this.name;

  override get logger(): Logger {
    return new SilentLogger();
  }

  override get prefix(): string {
    return "!";
  }

  override get parsedArguments() {
    if (this.ctx instanceof MockContext) {
      return this.ctx.mocked.arguments || super.parsedArguments;
    } else return super.parsedArguments;
  }

  static nameWithPrefix() {
    return "!" + this.name.toLowerCase();
  }

  protected async handleRunError(e: any) {
    throw e;
  }
}
