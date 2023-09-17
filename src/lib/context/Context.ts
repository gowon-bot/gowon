import { Guild, GuildMember, Message, User } from "discord.js";
import { GuildRequiredError, UnexpectedGowonError } from "../../errors/gowon";
import { GowonClient } from "../GowonClient";
import { Logger } from "../Logger";
import { Command } from "../command/Command";
import { ExtractedCommand } from "../command/extractor/ExtractedCommand";
import { Payload } from "./Payload";

export interface CustomContext<
  C extends Record<string, unknown> = Record<string, unknown>,
  M extends Record<string, unknown> = Record<string, unknown>
> {
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

export class GowonContext<T extends CustomContext = CustomContext> {
  private _command: Command | undefined;
  private custom: T;
  private _payload: Payload;
  private _extract: ExtractedCommand;
  private _logger: Logger;
  private gowonClient: GowonClient;

  get mutable(): NonNullable<T["mutable"]> {
    if (!this.custom.mutable) this.custom.mutable = {};

    return this.custom.mutable;
  }

  get constants(): NonNullable<T["constants"]> {
    if (!this.custom.constants) this.custom.constants = {};

    return this.custom.constants;
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
      throw new GuildRequiredError();
    }

    return this.payload.guild;
  }

  get author(): User {
    return this.payload.author;
  }

  get requiredAuthorMember(): GuildMember {
    if (!this.payload.member) {
      throw new UnexpectedGowonError(
        "Author member not found for that payload"
      );
    }

    return this.payload.member;
  }

  get authorMember(): GuildMember | undefined {
    return this.payload.member;
  }

  get client(): GowonClient {
    return this.gowonClient;
  }

  get botUser(): User {
    if (!this.client.client.user) {
      throw new UnexpectedGowonError(
        "A bot user could not be found in context"
      );
    }

    return this.client.client.user;
  }

  get botMember(): GuildMember | undefined {
    if (!this.client.client.user) {
      throw new UnexpectedGowonError(
        "A bot user could not be found in context"
      );
    }

    return this.guild?.members?.me ?? undefined;
  }

  get logger(): Logger {
    return this._logger;
  }

  get command(): Command {
    if (!this._command) {
      throw new UnexpectedGowonError("Command not found in context");
    }

    return this._command;
  }

  getMutable<T extends Record<string, unknown>>(): T {
    return this.mutable as T;
  }

  public isDM(): boolean {
    return (
      this.payload.isMessage() && this.payload.source?.channel?.type === "DM"
    );
  }

  public setCommand(command: Command) {
    this._command = command;
  }

  async getRepliedMessage(): Promise<Message | undefined> {
    if (this.payload.isMessage() && this.payload.source.reference) {
      return await this.payload.source.fetchReference();
    }

    return undefined;
  }

  /* Used to set commands from non-command places, eg. GuildEventService */
  /* eslint @typescript-eslint/no-explicit-any: 0 */
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
