import { BaseCommand } from "./command/BaseCommand";
import { User } from "discord.js";
import chalk from "chalk";
import { format } from "date-fns";
import { RunAs } from "./command/RunAs";
import { SimpleMap } from "../helpers/types";
import { Payload } from "./context/Payload";

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

  logCommandHandle(runAs: RunAs): void {
    Logger.log(
      `CommandHandler`,
      chalk`{grey found ${runAs
        .toCommandArray()
        .map((c) => c.name)
        .join(":")}}`
    );
  }

  openCommandHeader(command: BaseCommand): void {
    this.header = chalk`\n\n==============={yellow ${
      (command.parentName ? command.parentName + ":" : "") + command.name
    }}====================`;
  }

  closeCommandHeader(command: BaseCommand): void {
    Logger.log("Command", chalk.grey("finished"), this);
    Logger.output &&
      console.log(
        this.header +
          chalk`\n=============={yellow /${
            (command.parentName ? command.parentName + ":" : "") + command.name
          }}====================\n`
      );
  }

  logCommand(command: BaseCommand, payload: Payload, ...runAs: string[]): void {
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
      } {cyan in} ${payload.guild?.name || "{red DMs}"}
{cyan with arguments}: ${Logger.formatObject(
        this.sanitizeParamsForDisplay(command.parsedArguments)
      )}
{cyan as}: ${
        payload.isInteraction()
          ? `/${payload.source.commandName}`
          : runAs.join(" ")
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
  log(context: string, msg?: any): void {
    Logger.log(context, msg);
  }
}
