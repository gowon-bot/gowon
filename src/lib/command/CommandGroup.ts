import { SimpleMap } from "../../helpers/types";
import { flatDeep } from "../../helpers";
import { BaseCommand } from "./BaseCommand";

type CommandImpl = { new (): BaseCommand };
export type Commands = SimpleMap<CommandImpl>;

export class CommandGroup {
  public commands: BaseCommand[];
  public commandClasses: CommandImpl[];

  constructor(commands: CommandImpl[]) {
    this.commands = commands.map((c) => new c());
    this.commandClasses = commands;
  }

  asDeepList(): Array<BaseCommand> {
    return flatDeep(
      this.commands.map((c) =>
        c.hasChildren ? [c, ...c.children!.asDeepList()] : c
      )
    );
  }
}
