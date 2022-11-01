import { BaseChildCommand } from "../../../lib/command/ParentCommand";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

export abstract class SettingsChildCommand<
  T extends ArgumentsMap = {}
> extends BaseChildCommand<T> {
  parentName = "settings";
  subcategory = "settings";
}
