import { userMentionAtStartRegex } from "../../../helpers/discord";
import { GowonService } from "../../../services/GowonService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { Command } from "../Command";
import { CommandRegistry } from "../CommandRegistry";
import { ParentCommand } from "../ParentCommand";
import { ExtractedCommand } from "./ExtractedCommand";

export class CommandExtractor {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }
  commandRegistry = CommandRegistry.getInstance();

  async extract(
    messageString: string,
    guildID: string | undefined,
    commands: Command[]
  ): Promise<ExtractedCommand | undefined> {
    const splits = this.getSplits(guildID, messageString);

    for (const command of commands) {
      const extract = await this.attemptExtract(splits, guildID, command);

      if (extract) return extract;
    }

    return undefined;
  }

  private async attemptExtract(
    splits: [string, string | undefined],
    guildID: string | undefined,
    command: Command
  ): Promise<ExtractedCommand | undefined> {
    if (command instanceof ParentCommand) {
      const extract = await this.attemptParentExtract(command, guildID, splits);

      if (extract) return extract;
    }

    if (this.commandMatches(command, splits[0])) {
      return new ExtractedCommand([{ command, matched: splits[0] }]);
    }

    return undefined;
  }

  private commandMatches(command: Command, string: string): boolean {
    const cleanString = string.toLowerCase().trim();

    return (
      command.name.toLowerCase() === cleanString ||
      command.aliases.map((a) => a.toLowerCase()).includes(cleanString) ||
      this.commandHasVariation(command, string)
    );
  }

  private async attemptParentExtract(
    parentCommand: ParentCommand,
    guildID: string | undefined,
    splits: [string, string | undefined]
  ): Promise<ExtractedCommand | undefined> {
    const noPrefix = await this.attemptNoPrefixExtract(
      parentCommand,
      splits[0],
      guildID
    );

    if (noPrefix) {
      return new ExtractedCommand([
        { command: parentCommand, matched: "" },
        { command: noPrefix, matched: splits[0] },
      ]);
    }

    if (this.parentCommandMatches(parentCommand, splits[0])) {
      const extractedCommand = new ExtractedCommand([
        { command: parentCommand, matched: splits[0] },
      ]);

      if (splits[1]) {
        const child = await parentCommand.getChild(splits[1], guildID);

        if (child) {
          extractedCommand.add({ command: child, matched: splits[1] });
        }
      }

      return extractedCommand;
    }

    return undefined;
  }

  private parentCommandMatches(
    command: ParentCommand,
    string: string
  ): boolean {
    const cleanString = string.toLowerCase().trim();

    return typeof command.prefixes === "string"
      ? command.prefixes.toLowerCase().trim() === cleanString
      : command.prefixes
          .map((p) => p.toLowerCase().trim())
          .includes(cleanString);
  }

  private async attemptNoPrefixExtract(
    command: ParentCommand,
    string: string,
    guildID: string | undefined
  ): Promise<Command | undefined> {
    const child = await this.commandRegistry.find(
      string,
      guildID,
      command.children.commands
    );

    if (child?.command && command.noPrefixAliases.includes(string)) {
      return child.command;
    }

    return undefined;
  }

  private commandHasVariation(command: Command, string: string): boolean {
    for (let v of command.variations) {
      const variations =
        v.variation instanceof Array ? v.variation : [v.variation];

      const found = !!variations.find(
        (v) => v.toLowerCase() === string.toLowerCase()
      );

      if (found) return found;
    }

    return false;
  }

  private getSplits(
    guildID: string | undefined,
    messageString: string
  ): [string, string | undefined] {
    const splits = this.cleanContent(guildID, messageString).split(/\s+/);

    return [splits[0], splits[1]];
  }

  private cleanContent(guildID: string | undefined, content: string): string {
    const cleanContent = content.toLowerCase().trim();

    const prefixRegex = this.gowonService.prefixAtStartOfMessageRegex(guildID);

    // Run with prefix
    if (prefixRegex.test(cleanContent)) {
      return cleanContent
        .replace(
          new RegExp(this.gowonService.regexSafePrefix(guildID), "i"),
          ""
        )
        .trim();
    }
    // Run with mention
    else if (cleanContent.startsWith("<")) {
      return cleanContent.replace(userMentionAtStartRegex("\\d+"), "").trim();
    } else return content;
  }
}
