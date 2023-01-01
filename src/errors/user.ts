import { GowonContext } from "../lib/context/Context";
import { LilacUsersService } from "../services/lilac/LilacUsersService";
import { ServiceRegistry } from "../services/ServicesRegistry";
import { ClientError } from "./errors";

export class UserNotIndexedError extends ClientError {
  name = "UserNotIndexedError";

  constructor() {
    super("That user hasn't been indexed yet!");
  }
}

export async function throwSenderUserNotIndexed(
  ctx: GowonContext
): Promise<never> {
  if (
    await ServiceRegistry.get(LilacUsersService).isUserBeingIndexed(ctx, {
      discordID: ctx.author.id,
    })
  ) {
    throw new SenderUserStillBeingIndexedError();
  } else {
    throw new SenderUserNotIndexedError(ctx.command.prefix);
  }
}

class SenderUserNotIndexedError extends ClientError {
  name = "SenderUserNotIndexedError";

  constructor(prefix?: string) {
    super(
      `You need to be indexed to run this command, run \`${prefix}index\` to index yourself`
    );
  }
}

class SenderUserStillBeingIndexedError extends ClientError {
  name = "SenderUserNotIndexedError";

  constructor() {
    super(
      `You need to be fully indexed to run this command, please wait until you are done!`
    );
  }
}

export class SenderUserNotAuthenticatedError extends ClientError {
  name = "SenderUserNotAuthenticatedError";

  constructor(prefix?: string) {
    super(
      `This command requires you to be authenticated, please login again! (\`${prefix}login\`)`
    );
  }
}

export class MentionedUserNotIndexedError extends ClientError {
  name = "SenderUserNotIndexedError";

  constructor(prefix?: string) {
    super(
      `The user you mentioned hasn't been indexed yet, or isn't signed into the bot.\n*Run \`${prefix}index\` to index yourself*`
    );
  }
}

export class LastFMReverseLookupError extends ClientError {
  name = "LastFMReverseLookupError";

  constructor(username: string, requireIndexed = false, prefix?: string) {
    super(
      requireIndexed
        ? `The user you mentioned hasn't been indexed yet, or isn't signed into the bot.\n*Run \`${prefix}index\` to index yourself*`
        : `This command requires that \`${username}\` be signed into Gowon!`
    );
  }
}
