import { BaseCommand, Command } from "./command/BaseCommand";
import { Message } from "discord.js";
import chalk from "chalk";
import moment from "moment";

export class Logger {
  static log(context: string, msg?: any, logger?: Logger): void {
    let logString =
      chalk`{black (${moment().format(
        "HH:mm:ss a SSS[ms]"
      )})} {grey ${context}:}` +
      " " +
      msg;

    if (logger) {
      logger.header += "\n" + logString;
    } else {
      console.log(logString);
    }
  }

  header = "";

  logCommandHandlerSearch(commandName: string): void {
    Logger.log(
      "CommandHandler",
      chalk`{grey looking for command} {bgGrey ${commandName}}`
    );
  }

  logCommandHandle(command: Command): void {
    Logger.log(`CommandHandler`, chalk`{grey found ${command.name}}`);
  }

  openCommandHeader(command: BaseCommand): void {
    this.header = chalk`\n==============={yellow ${
      (command.parentName ? command.parentName + ":" : "") + command.name
    }}====================`;
  }

  closeCommandHeader(command: BaseCommand): void {
    Logger.log("Command", chalk.grey("finished"), this);
    console.log(
      this.header +
        chalk`\n=============={yellow /${
          (command.parentName ? command.parentName + ":" : "") + command.name
        }}====================`
    );
  }

  logCommand(command: BaseCommand, message: Message, runAs?: string): void {
    this.header +=
      "\n" +
      chalk`
{cyan Ran at}: ${message.createdAt} {cyan by} ${message.author.username}
{cyan with arguments}: ${JSON.stringify(command.parsedArguments, undefined, 2)}
{cyan as}: ${runAs}

{cyan Raw message content}:
{bgGrey ${message.content}}
{cyan Activity:}`;
    Logger.log("Command", chalk.grey("started"), this);
  }

  logError(error: any): void {
    if (error.isClientFacing) {
      this.header += "\n" + chalk`{red ERROR: ${error}}`;
    } else if (error instanceof Error) {
      this.header += "\n" + chalk.red("ERROR: " + error.stack);
    } else {
      this.header += "\n" + chalk.red("ERROR: " + error);
    }
  }
}
