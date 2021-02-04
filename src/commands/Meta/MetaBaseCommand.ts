import { Arguments } from "../../lib/arguments/arguments";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { ParentCommand, ChildCommand } from "../../lib/command/ParentCommand";
import { MetaService } from "../../services/dbservices/MetaService";

export abstract class MetaBaseCommand<
  T extends Arguments = Arguments
> extends BaseCommand<T> {
  category = "meta";

  metaService = new MetaService();
}

export abstract class MetaBaseParentCommand extends ParentCommand {
  description = "Information about the bot";
  category = "meta";
}

export abstract class MetaBaseChildCommand<
  T extends Arguments = Arguments
> extends ChildCommand<T> {
  category = "meta";
  secretCommand = true;

  metaService = new MetaService();
}
