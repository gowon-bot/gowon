import { CommandAccess } from "../../../lib/command/access/access";
import { Command } from "../../../lib/command/Command";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

export abstract class ContentModerationCommand<
  ArgumentsType extends ArgumentsMap = {}
> extends Command<ArgumentsType> {
  public access = new CommandAccess("contentmoderator");
}
