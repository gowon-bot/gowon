import { Response } from "node-fetch";
import {
  InvalidSpotifyScopeError,
  NoActivePlayerError,
  SpotifyConnectionError,
  SpotifyPremiumRequiredError,
} from "../../errors/external/spotify";
import { GowonContext } from "../../lib/context/Context";

interface SpotifyError {
  error: {
    status: number;
    message: string;
    reason: string;
  };
}

export async function parseError(
  ctx: GowonContext,
  response: Response
): Promise<Error> {
  if ([404, 403].includes(response.status)) {
    const json = (await response.json()) as SpotifyError;

    switch (json.error.reason) {
      case spotifyErrorReasons.noActiveDevice:
        throw new NoActivePlayerError();

      case spotifyErrorReasons.premiumRequired:
        throw new SpotifyPremiumRequiredError();
    }

    switch (json.error.message) {
      case spotifyErrorMessages.badScope:
        throw new InvalidSpotifyScopeError(ctx.command.prefix);
    }
  }

  throw new SpotifyConnectionError(ctx.command.prefix);
}

const spotifyErrorReasons = {
  noActiveDevice: "NO_ACTIVE_DEVICE",
  premiumRequired: "PREMIUM_REQUIRED",
} as const;

const spotifyErrorMessages = {
  badScope: "Insufficient client scope",
} as const;
