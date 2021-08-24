import { Command } from "../../lib/command/Command";
import { CommandRegistry } from "../../lib/command/CommandRegistry";

export default (registry: CommandRegistry) => ({
  queries: {
    commands(_: any, { keywords }: { keywords: string }) {
      const commands = registry.deepList();

      const results = registry.search(commands, keywords);

      return results
        .map(commandToData)
        .sort((a, b) => a.friendlyName.localeCompare(b.friendlyName));
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
  };
}

function convertToArray<T = any>(value: Array<T> | T): Array<T> {
  if (value instanceof Array) {
    return value;
  } else {
    return [value];
  }
}
