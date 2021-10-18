import { LogicError } from "../../errors";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { RollbarService } from "../../services/Rollbar/RollbarService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

const args = {
  inputs: {},
  mentions: {},
  flags: {},
} as const;

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123";
  secretCommand = true;
  subcategory = "developer";

  arguments = args;

  rollbarService = ServiceRegistry.get(RollbarService);

  async run() {
    throw new LogicError("Hello, world!");
    // await this.send("Hello, world!");
  }
}
