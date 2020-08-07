import { BaseCommand } from "../../lib/command/BaseCommand";
import { ParentCommand, ChildCommand } from "../../lib/command/ParentCommand";
import { MetaService } from "../../services/dbservices/MetaService";

export abstract class MetaBaseCommand extends BaseCommand {
  category = "meta";

  metaService = new MetaService();
}

export abstract class MetaBaseParentCommand extends ParentCommand {
  category = "meta";
}

export abstract class MetaBaseChildCommand extends ChildCommand {
  category = "meta";

  metaService = new MetaService();
}
