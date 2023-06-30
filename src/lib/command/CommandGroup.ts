import { flatDeep } from "../../helpers";
import { Command } from "./Command";

export type CommandClass = { new (): Command };

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
