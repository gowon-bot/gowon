import { User } from "../database/entity/User";
import { Requestable } from "../services/LastFM/LastFMAPIService";

interface Requestables {
  senderUsername: string;
  senderRequestable: Requestable;

  username: string;
  requestable: Requestable;
}

export function buildRequestables({
  senderUser,
  mentionedUser,
  mentionedUsername,
}: {
  senderUser?: User;
  mentionedUser?: User;
  mentionedUsername?: string;
}): Requestables | undefined {
  if (!senderUser && !mentionedUsername && !mentionedUser) {
    return undefined;
  }

  let requestables = {} as Partial<Requestables>;

  const senderRequestable = buildRequestable(
    senderUser?.lastFMUsername!,
    senderUser
  );
  requestables.senderRequestable = senderRequestable.requestable;
  requestables.senderUsername = senderRequestable.username;

  if (mentionedUser || mentionedUsername) {
    const requestable = buildRequestable(mentionedUsername!, mentionedUser);

    requestables.requestable = requestable.requestable;
    requestables.username = requestable.username;
  } else {
    requestables.requestable = senderRequestable.requestable;
    requestables.username = senderRequestable.username;
  }

  return requestables as Requestables;
}

export function compareUsernames(
  u1: string | undefined,
  u2: string | undefined
): boolean {
  if (!u1 || !u2) return false;

  return u1.toLowerCase() === u2.toLowerCase();
}

export function buildRequestable(
  username: string,
  user?: User
): { requestable: Requestable; username: string } {
  if (user?.lastFMSession && user?.lastFMUsername) {
    return {
      username,
      requestable: {
        username: user.lastFMUsername,
        session: user.lastFMSession,
      },
    };
  } else {
    return { requestable: username, username };
  }
}
