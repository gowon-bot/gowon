import { Command } from "./Command";
import { SimpleMap } from "../../helpers/types";
import { flatDeep } from "../../helpers";

type CommandImpl = { new (): Command };
export type Commands = SimpleMap<CommandImpl>;

export class CommandGroup {
  public commands: Command[];

  constructor(commands: CommandImpl[]) {
    this.commands = commands.map((c) => new c());
  }

  asDeepList(): Array<Command> {
    return flatDeep(
      this.commands.map((c) =>
        c.hasChildren ? [c, ...c.children!.asDeepList()] : c
      )
    );
  }
}
