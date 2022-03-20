import { Guild, GuildMember, User } from "discord.js";
import { LogicError } from "../../errors/errors";
import { BaseCommand } from "../command/BaseCommand";
import { RunAs } from "../command/RunAs";
import { GowonClient } from "../GowonClient";
import { Logger } from "../Logger";
import { Payload } from "./Payload";

export interface CustomContext<C, M> {
  constants?: C;
  mutable?: M;
}

export interface ContextParamaters<CustomContextT> {
  command?: BaseCommand;
  custom?: CustomContextT;
  logger?: Logger;
  payload: Payload;
  runAs: RunAs;
  gowonClient: GowonClient;
}

export class GowonContext<
  T extends CustomContext<any, any> = CustomContext<{}, {}>
> {
  private _command: BaseCommand | undefined;
  private custom: T;
  private _payload: Payload;
  private _runAs: RunAs;
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
    this._runAs = params.runAs;
    this.gowonClient = params.gowonClient;
    this._logger = params.logger || new Logger();
  }

  public addContext(context: T) {
    this.custom = Object.assign(this.custom, context);
  }

  get payload(): Payload {
    return this._payload;
  }

  get runAs(): RunAs {
    return this._runAs;
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

  get command(): BaseCommand {
    return this._command!;
  }

  public setCommand(command: BaseCommand) {
    this._command = command;
  }

  // Used to set commands from non-command places
  public dangerousSetCommand(command: any) {
    this._command = Object.assign(this._command || {}, command);
  }
}

export type UnwrapContext<T extends GowonContext<CustomContext<any, any>>> =
  T extends GowonContext<infer U> ? U : never;
