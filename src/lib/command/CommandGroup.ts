import { SimpleMap } from "../../helpers/types";
import { flatDeep } from "../../helpers";
import { Command } from "./Command";

type CommandClass = { new (): Command };
export type Commands = SimpleMap<CommandClass>;

export class CommandGroup {
  public commands: Command[];
  public commandClasses: { command: CommandClass; parentID?: string }[];

  constructor(commands: CommandClass[], parentID?: string) {
    this.commands = commands.map((c) => {
      const command = new c();

      command.parentID = parentID;

      return command;
    });

    this.commandClasses = commands.map((c) => ({ command: c, parentID }));
  }

  asDeepList(): Array<Command> {
    return flatDeep(
      this.commands.map((c) =>
        c.hasChildren ? [c, ...c.children!.asDeepList()] : c
      )
    );
  }
}
