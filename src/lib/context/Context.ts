import { Guild, User } from "discord.js";
import { BaseCommand } from "../command/BaseCommand";
import { GowonClient } from "../GowonClient";
import { Logger } from "../Logger";

export interface CustomContext<C, M> {
  constants?: C;
  mutable?: M;
}

export interface ContextParamaters<CustomContextT> {
  command: BaseCommand;
  custom: CustomContextT;
}

export class GowonContext<
  T extends CustomContext<any, any> = CustomContext<{}, {}>
> {
  private _command: BaseCommand;
  private custom: T;

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
    this.custom = params.custom;
  }

  public addContext(context: T) {
    this.custom = Object.assign(this.custom, context);
  }

  get guild(): Guild {
    return this._command.guild;
  }

  get author(): User {
    return this._command.author;
  }

  get client(): GowonClient {
    return this._command.gowonClient;
  }

  get logger(): Logger {
    return this._command.logger;
  }

  get command(): BaseCommand {
    return this._command;
  }

  // Used to set commands from non-command places
  public dangerousSetCommand(command: any) {
    this._command = Object.assign(this._command || {}, command);
  }
}

export type UnwrapContext<T extends GowonContext<CustomContext<any, any>>> =
  T extends GowonContext<infer U> ? U : never;
