import { Command } from "../../lib/command/Command";
import {
  ParentCommand,
  BaseChildCommand,
} from "../../lib/command/ParentCommand";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { MetaService } from "../../services/dbservices/MetaService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export abstract class MetaBaseCommand<
  T extends ArgumentsMap = {}
> extends Command<T> {
  category = "meta";

  metaService = ServiceRegistry.get(MetaService);
}

export abstract class MetaBaseParentCommand extends ParentCommand {
  description = "Information about the bot";
  category = "meta";
}

export abstract class MetaBaseChildCommand<
  T extends ArgumentsMap = {}
> extends BaseChildCommand<T> {
  category = "meta";
  secretCommand = true;

  metaService = ServiceRegistry.get(MetaService);
}
