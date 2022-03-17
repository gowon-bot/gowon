import { ArgumentsMap } from "../context/arguments/types";
import { BaseCommand } from "./BaseCommand";

export interface ChildCommand<T extends ArgumentsMap = {}>
  extends BaseCommand<T> {
  parentName: string;
}

export function isChildCommand(command: BaseCommand): command is ChildCommand {
  return command.isChild ?? false;
}
