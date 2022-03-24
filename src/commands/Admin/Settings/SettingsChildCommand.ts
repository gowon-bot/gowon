import { BaseChildCommand } from "../../../lib/command/ParentCommand";

export abstract class SettingsChildCommand extends BaseChildCommand {
  parentName = "settings";
  subcategory = "settings";
}
