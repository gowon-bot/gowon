import chalk from "chalk";
import { format } from "date-fns";
import { User } from "discord.js";
import { SimpleMap } from "../helpers/types";
import { Command } from "./command/Command";
import { ExtractedCommand } from "./command/extractor/ExtractedCommand";
import { GowonContext } from "./context/Context";

export class Logger {
  static output = true;

  static log(context: string, msg?: any, logger?: Logger): void {
    if (!this.output) return;

    let logString =
      chalk`{grey.bold (${format(
        new Date(),
        "HH:mm:ss a SSS'ms'"
      )})} {grey ${context}:}` +
      " " +
      msg;

    if (logger) {
      logger.header += "\n" + logString;
    } else {
      console.log(logString);
    }
  }

  static formatObject(object: any): string {
    return JSON.stringify(object, undefined, 2);
  }

  header = "";

  log(context: string, msg?: any): void {
    Logger.log(context, msg, this);
  }

  logCommandHandlerSearch(commandName: string): void {
    Logger.log(
      "CommandHandler",
      chalk`{grey looking for command} {bgGrey ${commandName}}`
    );
  }

  logCommandHandle(extract: ExtractedCommand): void {
    Logger.log(
      `CommandHandler`,
      chalk`{grey found ${extract.commandStack
        .map(({ command }) => command.name)
        .join(":")}}`
    );
  }

  openCommandHeader(command: Command): void {
    this.header = chalk`\n\n==============={yellow ${
      (command.parentName ? command.parentName + ":" : "") + command.name
    }}====================`;
  }

  closeCommandHeader(command: Command): void {
    Logger.log("Command", chalk.grey("finished"), this);
    Logger.output &&
      console.log(
        this.header +
          chalk`\n=============={yellow /${
            (command.parentName ? command.parentName + ":" : "") + command.name
          }}====================\n`
      );
  }

  logCommand(ctx: GowonContext): void {
    const command = ctx.command;
    const payload = ctx.payload;
    const commandStack = ctx.extract.commandStack;

    let redirectedFrom = command.redirectedFrom;

    this.header +=
      "\n" +
      chalk`
{cyan ID}: ${command.id}
${
  redirectedFrom
    ? chalk`{cyan Redirected from}: ${
        (redirectedFrom.parentName ? redirectedFrom.parentName + ":" : "") +
        redirectedFrom.name
      }\n`
    : ""
}{cyan Ran at}: ${payload.source.createdAt} {cyan by} ${
        payload.author.username
      } ${chalk`{cyan in} ${payload.guild?.name || chalk`{red DMs}`}`}
{cyan with arguments}: ${Logger.formatObject(
        this.sanitizeParamsForDisplay(command.parsedArguments)
      )}
{cyan as}: ${
        payload.isInteraction()
          ? `/${payload.source.commandName}`
          : commandStack.map((c) => c.command.name).join(" ")
      }

{cyan Raw message content}:
${payload.isMessage() ? chalk`{bgGrey ${payload.source.content}}` : ""}
{cyan Activity:}`;
    Logger.log("Command", chalk.grey("started"), this);
  }

  logError(error: any): void {
    if (error.isClientFacing) {
      this.header += "\n" + chalk.red(`ERROR: ${error}`);
    } else if (error instanceof Error) {
      this.header += "\n" + chalk.red("ERROR: " + error.stack);
    } else {
      this.header += "\n" + chalk.red("ERROR: " + error);
    }
  }

  private sanitizeParamsForDisplay(params: SimpleMap): SimpleMap {
    return Object.entries(params).reduce((acc, [key, value]) => {
      if (value instanceof User) {
        acc[key] = `<Discord User '${value.tag}' (${value.id})>`;
      } else if (key !== "debug") {
        acc[key] = value;
      }

      return acc;
    }, {} as SimpleMap);
  }
}

export class HeaderlessLogger extends Logger {
  override log(context: string, msg?: any): void {
    Logger.log(context, msg);
  }
}
