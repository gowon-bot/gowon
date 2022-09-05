import { Guild, GuildMember, User } from "discord.js";
import { LogicError } from "../../errors/errors";
import { Command } from "../command/Command";
import { ExtractedCommand } from "../command/extractor/ExtractedCommand";
import { GowonClient } from "../GowonClient";
import { Logger } from "../Logger";
import { Payload } from "./Payload";

export interface CustomContext<C, M> {
  constants?: C;
  mutable?: M;
}

export interface ContextParamaters<CustomContextT> {
  command?: Command;
  custom?: CustomContextT;
  logger?: Logger;
  payload: Payload;
  extract: ExtractedCommand;
  gowonClient: GowonClient;
}

export class GowonContext<
  T extends CustomContext<any, any> = CustomContext<{}, {}>
> {
  private _command: Command | undefined;
  private custom: T;
  private _payload: Payload;
  private _extract: ExtractedCommand;
  private _logger: Logger;
  private gowonClient: GowonClient;

  get mutable(): NonNullable<T["mutable"]> {
    if (!this.custom.mutable) this.custom.mutable = {};

    return this.custom.mutable!;
  }

  get constants(): NonNullable<T["constants"]> {
    if (!this.custom.constants) this.custom.constants = {};

    return this.custom.constants!;
  }

  constructor(params: ContextParamaters<T>) {
    this._command = params.command;
    this._payload = params.payload;
    this.custom = (params.custom || {}) as T;
    this._extract = params.extract;
    this.gowonClient = params.gowonClient;
    this._logger = params.logger || new Logger();
  }

  public addContext(context: T) {
    this.custom = Object.assign(this.custom, context);
  }

  get payload(): Payload {
    return this._payload;
  }

  get extract(): ExtractedCommand {
    return this._extract;
  }

  get guild(): Guild | undefined {
    return this.payload.guild;
  }

  get requiredGuild(): Guild {
    if (!this.payload.guild) {
      throw new LogicError("This command must be run in a server!");
    }

    return this.payload.guild!;
  }

  get author(): User {
    return this.payload.author;
  }

  get authorMember(): GuildMember {
    return this.payload.member!;
  }

  get client(): GowonClient {
    return this.gowonClient;
  }

  get logger(): Logger {
    return this._logger;
  }

  get command(): Command {
    return this._command!;
  }

  public setCommand(command: Command) {
    this._command = command;
  }

  // Used to set commands from non-command places
  public dangerousSetCommand(command: any) {
    this._command = Object.assign(this._command || {}, command);
  }

  // Used to set authors from places without a real discord author
  public dangerousSetAuthor(userID: string) {
    this._payload.source = Object.assign(this._payload.source, {
      author: { id: userID },
    });
  }
}

export type UnwrapContext<T extends GowonContext<CustomContext<any, any>>> =
  T extends GowonContext<infer U> ? U : never;
