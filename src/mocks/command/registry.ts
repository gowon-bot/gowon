import { Command } from "../../lib/command/Command";
import { CommandClass } from "../../lib/command/CommandGroup";
import { CommandRegistry } from "../../lib/command/CommandRegistry";

export function mockRegistry(commands: { new (): Command }[]) {
  const commandRegistry = CommandRegistry.getInstance();

  commandRegistry.init(
    commands.reduce((acc, c) => {
      acc.push(c);

      return acc;
    }, [] as CommandClass[])
  );

  return commandRegistry;
}
