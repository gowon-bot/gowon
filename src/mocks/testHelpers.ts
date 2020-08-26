import { MessageEmbed } from "discord.js";
import { BaseCommand } from "../lib/command/BaseCommand";

export function responseContains<T extends BaseCommand>(
  command: T,
  string: string
): boolean {
  let response = command.responses[0];

  if (response instanceof MessageEmbed) {
    return response.description?.includes(string) || false;
  } else {
    return response.includes(string);
  }
}
