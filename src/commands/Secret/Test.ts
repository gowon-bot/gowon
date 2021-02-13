import { BaseCommand } from "../../lib/command/BaseCommand";

const args = {
  inputs: {
    token: { index: 0 },
  },
  mentions: {},
};

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123";
  secretCommand = true;

  arguments = args;

  async run() {
    await this.send("Hello, world!");
  }
}
