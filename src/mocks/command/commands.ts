import { MockCommand } from "./MockCommand";

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
