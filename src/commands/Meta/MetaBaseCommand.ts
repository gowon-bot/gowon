import { BaseCommand } from "../../lib/command/BaseCommand";
import { ParentCommand, ChildCommand } from "../../lib/command/ParentCommand";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { MetaService } from "../../services/dbservices/MetaService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export abstract class MetaBaseCommand<
  T extends ArgumentsMap = {}
> extends BaseCommand<T> {
  category = "meta";

  metaService = ServiceRegistry.get(MetaService);
}

export abstract class MetaBaseParentCommand extends ParentCommand {
  description = "Information about the bot";
  category = "meta";
}

export abstract class MetaBaseChildCommand<
  T extends ArgumentsMap = {}
> extends ChildCommand<T> {
  category = "meta";
  secretCommand = true;

  metaService = ServiceRegistry.get(MetaService);
}
