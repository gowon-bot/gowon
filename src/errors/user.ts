import { code } from "../helpers/discord";
import { GowonContext } from "../lib/context/Context";
import { LilacUsersService } from "../services/lilac/LilacUsersService";
import { ServiceRegistry } from "../services/ServicesRegistry";
import { ClientError } from "./errors";

export class UserNotIndexedError extends ClientError {
  constructor() {
    super("That user hasn't been indexed yet!");
  }
}

export async function throwSenderUserNotIndexed(
  ctx: GowonContext
): Promise<never> {
  if (
    await ServiceRegistry.get(LilacUsersService).isBeingIndexed(ctx, {
      discordID: ctx.author.id,
    })
  ) {
    throw new SenderUserStillBeingIndexedError();
  } else {
    throw new SenderUserNotIndexedError(ctx.command.prefix);
  }
}

class SenderUserNotIndexedError extends ClientError {
  constructor(prefix?: string) {
    super(
      `You need to be indexed to run this command, run \`${prefix}index\` to index yourself`
    );
  }
}

class SenderUserStillBeingIndexedError extends ClientError {
  constructor() {
    super(
      `You need to be fully indexed to run this command, please wait until you are done!`
    );
  }
}

export class SenderUserNotAuthenticatedError extends ClientError {
  constructor(prefix?: string) {
    super(
      `This command requires you to be authenticated, please login again! (\`${prefix}login\`)`
    );
  }
}

export class MentionedUserNotAuthenticatedError extends ClientError {
  constructor(prefix?: string) {
    super(
      `This command requires that user to be authenticated, they must login again! (\`${prefix}login\`)`
    );
  }
}

export class MentionedUserNotIndexedError extends ClientError {
  constructor(prefix?: string) {
    super(
      `The user you mentioned hasn't been indexed yet, or isn't signed into the bot.\n*See \`${prefix}help index\` for help with indexing *`
    );
  }
}

export class MentionedSignInRequiredError extends ClientError {
  constructor(username: string) {
    super(`This command requires that \`${username}\` be signed into Gowon!`);
  }
}

export class SenderSignInRequiredError extends ClientError {
  constructor(prefix: string) {
    super(
      `Please sign in with a last.fm account! (\`${prefix}login\`)`,
      `Don't have one? You can create one at https://last.fm/join`
    );
  }
}

export class MentionedUserRequiredError extends ClientError {
  constructor() {
    super(`Please mention a user who is signed into Gowon!`);
  }
}

export class CouldNotSetUserAsPatronError extends ClientError {
  constructor() {
    super(`Something went wrong setting that user as a patron`);
  }
}

export class CouldNotFindUserWithUsername extends ClientError {
  constructor(username: string) {
    super(
      `Couldn't find anyone logged in as ${code(username)} in this server.`
    );
  }
}
