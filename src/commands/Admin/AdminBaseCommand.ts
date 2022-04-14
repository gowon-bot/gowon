import { ArgumentsMap } from "../../lib/context/arguments/types";
import { Command } from "../../lib/command/Command";
import {
  ParentCommand,
  BaseChildCommand,
} from "../../lib/command/ParentCommand";

export abstract class AdminBaseCommand extends Command {
  category = "admin";
}

export abstract class AdminBaseParentCommand extends ParentCommand {
  category = "admin";
}

export abstract class AdminBaseChildCommand<
  T extends ArgumentsMap
> extends BaseChildCommand<T> {
  category = "admin";
}
