import { Permission, PermissionType } from "../../database/entity/Permission";
import { code } from "../../helpers/discord";
import { ClientError } from "../errors";

export class CannotChangePrefixError extends ClientError {
  name = "CannotChangePrefixError";

  constructor() {
    super(
      "You don't have the correct permissions to change the prefix! You need the 'Administrator' Discord permission to change the prefix"
    );
  }
}

function getPermissionAlreadyExistsMessage(permission: Permission): string {
  switch (permission.type) {
    case PermissionType.bot:
      return "That command has already been disabled bot-wide!";

    case PermissionType.channel:
      return "That command has already been disabled in that channel!";

    case PermissionType.guild:
      return "That command has already been disabled in this server!";

    case PermissionType.guildMember:
      return "That user has already been banned from running that command!";

    case PermissionType.role:
      return "That role has already been banned from running that command";

    case PermissionType.user:
      return "That user has already been banned from running that command";
  }
}

export class PermissionAlreadyExistsError extends ClientError {
  name = "PermissionAlreadyExistsError";

  constructor(permission: Permission) {
    super(getPermissionAlreadyExistsMessage(permission));
  }
}

function getPermissionDoesNotExistMessage(permission: Permission): string {
  switch (permission.type) {
    case PermissionType.bot:
      return "That command has was not disabled bot-wide!";

    case PermissionType.channel:
      return "That command was not disabled in that channel!";

    case PermissionType.guild:
      return "That command was not disabled in this server!";

    case PermissionType.guildMember:
      return "That user is not banned from running that command!";

    case PermissionType.role:
      return "That role is not banned from running that command";

    case PermissionType.user:
      return "That user is not banned from running that command";
  }
}

export class PermissionDoesNotExistError extends ClientError {
  name = "PermissionDoesNotExistError";

  constructor(permission: Permission) {
    super(getPermissionDoesNotExistMessage(permission));
  }
}

export class CannotDisableCommandError extends ClientError {
  name = "CannotDisableCommandError";

  constructor(commandName: string) {
    super(`You can't disable the ${code(commandName)} command!`);
  }
}

export class MustBeAPatronError extends ClientError {
  name = "MustBeAPatronError";

  constructor() {
    super(`You must be a patron to access this command!`);
  }
}
