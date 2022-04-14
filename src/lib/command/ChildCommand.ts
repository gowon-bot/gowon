import { ArgumentsMap } from "../context/arguments/types";
import { Command } from "./Command";

export interface ChildCommand<T extends ArgumentsMap = {}> extends Command<T> {
  parentName: string;
  parentID?: string;
}

export function isChildCommand(command: Command): command is ChildCommand {
  return command.isChild ?? false;
}
