import { SimpleMap } from "../../helpers/types";
import { Command } from "../../lib/command/Command";
import { CommandRegistry } from "../../lib/command/CommandRegistry";

export function mockRegistry(commands: { new (): Command }[]) {
  const commandRegistry = CommandRegistry.getInstance();
  commandRegistry.init(
    commands.reduce((acc, c) => {
      acc[c.name] = c;

      return acc;
    }, {} as SimpleMap<{ new (): Command }>)
  );

  return commandRegistry;
}
