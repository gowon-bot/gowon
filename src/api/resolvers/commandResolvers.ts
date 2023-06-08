import { Command } from "../../lib/command/Command";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { PermissionsCacheContext } from "../../lib/permissions/PermissionsCacheService";
import { PermissionsService } from "../../lib/permissions/PermissionsService";
import { MockMessage } from "../../mocks/discord";
import { ServiceRegistry } from "../../services/ServicesRegistry";

const registry = CommandRegistry.getInstance();
const permissionsService = ServiceRegistry.get(PermissionsService);

export default (ctx: PermissionsCacheContext) => ({
  queries: {
    async commands(
      _: any,
      {
        keywords,
        isAdmin,
        inDMs,
      }: { keywords: string; isAdmin?: boolean; inDMs?: boolean },
      { doughnutID }: { doughnutID: string }
    ) {
      ctx.payload.source = new MockMessage("", { authorID: doughnutID });
      ctx.constants.isAdmin = isAdmin ?? true;

      const allCommands = registry.deepList({ includeOnlyDMCommands: inDMs });

      const results = registry.search(allCommands, keywords);

      const canChecks = await permissionsService.canListInContext(ctx, results);

      const commands = canChecks
        .filter((c) => c.allowed)
        .map((cc) => cc.command);

      return commands.map(commandToData);
    },
  },
});

export interface CommandResponse {
  id: string;
  idSeed: string;
  name: string;
  friendlyName: string;
  description: string;
  parentName?: string;

  aliases: string[];
  variations: VariationResponse[];

  category?: string;
  subcategory?: string;
  usage: string[];

  hasChildren: boolean;
  children: CommandResponse[];
}

export interface VariationResponse {
  name: string;
  variation: string[];
  description?: string;
}

function commandToData(command: Command): CommandResponse {
  return {
    id: command.id,
    idSeed: command.idSeed,
    name: command.name,
    friendlyName: command.friendlyName,
    description: command.description,
    parentName: command.parentName,

    aliases: convertToArray(command.aliases),
    variations: command.variations.map((v) => ({
      name: v.name,
      description: v.description,
      variation: convertToArray(v.variation),
    })),

    category: command.category,
    subcategory: command.subcategory,
    usage: convertToArray(command.usage),

    hasChildren: command.hasChildren,
    children: command.children?.commands.map((c) => commandToData(c)) || [],
  };
}

function convertToArray<T = any>(value: Array<T> | T): Array<T> {
  if (value instanceof Array) {
    return value;
  } else {
    return [value];
  }
}
