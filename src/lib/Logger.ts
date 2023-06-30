import chalk from "chalk";
import { format } from "date-fns";
import { User } from "discord.js";
import { SimpleMap } from "../helpers/types";
import { Command } from "./command/Command";
import { Runnable, RunnableType } from "./command/Runnable";
import { ExtractedCommand } from "./command/extractor/ExtractedCommand";
import { InteractionReply } from "./command/interactions/InteractionReply";
import { GowonContext } from "./context/Context";
import { displayUserTag } from "./views/displays";

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

  logCommandHandle(extract: ExtractedCommand): void {
    Logger.log(
      `CommandHandler`,
      chalk`{grey found ${extract.commandStack
        .map(({ command }) => command.name)
        .join(":")}}`
    );
  }

  openRunnableHeader(runnable: Runnable): void {
    this.header = chalk`\n\n==============={yellow ${getRunnableName(
      runnable
    )} {red (${
      runnable.type === RunnableType.Command ? "Command" : "Interaction reply"
    })}}====================`;
  }

  closeRunnableHeader(runnable: Runnable): void {
    Logger.log("Command", chalk.grey("finished"), this);
    Logger.output &&
      console.log(
        this.header +
          chalk`\n=============={yellow /${getRunnableName(
            runnable
          )}}====================\n`
      );
  }

  logRunnable(ctx: GowonContext): void {
    const runnable = ctx.runnable;
    const payload = ctx.payload;
    const commandStack = ctx.extract.commandStack;

    const redirectedFrom =
      runnable instanceof Command ? runnable.redirectedFrom : undefined;

    this.header +=
      "\n" +
      chalk`
{cyan ID}: ${runnable.id}
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
        this.sanitizeParamsForDisplay(runnable.parsedArguments)
      )}
{cyan as}: ${
        payload.isInteraction() && payload.source.isCommand()
          ? `/${payload.source.commandName}`
          : payload.isMessage()
          ? commandStack.map((c) => c.command.name).join(" ")
          : getRunnableName(runnable)
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
        acc[key] = `<Discord User '${displayUserTag(value)}' (${value.id})>`;
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

export class SilentLogger extends Logger {
  override log(_context: string, _msg?: any): void {}
  override closeRunnableHeader(_command: Command): void {}
  override logCommandHandle(_extract: ExtractedCommand): void {}
}

function getRunnableName(runnable: Runnable): string {
  switch (runnable.type) {
    case RunnableType.Command:
      const command = runnable as Command;

      return (
        (command.parentName ? command.parentName + ":" : "") + command.name
      );
    case RunnableType.InteractionReply:
      const interactionReply = runnable as InteractionReply;

      return interactionReply.constructor.name;
  }
}
