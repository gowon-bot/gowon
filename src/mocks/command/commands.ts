import { Logger, SilentLogger } from "../../lib/Logger";
import { Command } from "../../lib/command/Command";

abstract class MockCommand extends Command {
  idSeed = this.name;

  override get logger(): Logger {
    return new SilentLogger();
  }

  static nameWithPrefix() {
    return "!" + this.name.toLowerCase();
  }

  protected async handleRunError(e: any) {
    console.log("throwing: e");
    throw e;
  }
}

export class CommandThatShouldntRun extends MockCommand {
  async run() {
    throw "I shouldn't run!";
  }
}

export class DummyCommand extends MockCommand {
  async run() {}
}

export class CommandThatReplies extends MockCommand {
  async run() {
    this.reply("Hello, world!");
  }
}
