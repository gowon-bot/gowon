import { Command } from "../command/Command";
import { Emoji } from "../emoji/Emoji";

export function displayCommandIcons(command: Command): string {
  return (
    (command.access?.role ? `${Emoji[command.access.role]} ` : "") +
    [
      command.slashCommand ? Emoji.slashCommand : Emoji.notASlashCommand,
      command.guildRequired ? Emoji.doesNotRunInDMs : Emoji.runsInDMs,
      command.adminCommand ? Emoji.requiresAdmin : Emoji.doesNotRequireAdmin,
    ].join("")
  );
}
