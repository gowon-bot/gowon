import { ClientError } from "../../errors";

export class SpotifyConnectionError extends ClientError {
  name = "SpotifyConnectionError";

  constructor(prefix: string) {
    super(
      "There was an issue connecting to Spotify, please try again in a few moments",
      `If the issue persists, please let us know in the support server (${prefix}help)`
    );
  }
}

export class NotAuthenticatedWithSpotifyError extends ClientError {
  name = "NotAuthenticatedWithSpotifyError";

  constructor(prefix: string) {
    super(
      `You need to be authenticated with Spotify in order to run this command! Please login with \`${prefix}slogin\``
    );
  }
}

export class NotASpotifyLinkError extends ClientError {
  name = "NotASpotifyLinkError";

  constructor() {
    super(`The message you replied to doesn't contain a Spotify link!`);
  }
}

export class NoActivePlayerError extends ClientError {
  name = "NoActivePlayerError";

  constructor() {
    super(
      "No active device found, try playing some music on one of your Spotify devices to set an active player."
    );
  }
}

export class SpotifyPremiumRequiredError extends ClientError {
  name = "SpotifyPremiumRequiredError";

  constructor() {
    super(
      "Unfortunately, a Spotify premium account is required to use this feature!"
    );
  }
}

export class InvalidSpotifyScopeError extends ClientError {
  name = "InvalidSpotifyScopeError";

  constructor(prefix: string) {
    super(
      `This command requires extra permissions, please re-authenticate with Spotify to run this command! (\`${prefix}slogin\`)`
    );
  }
}

export class PrivateModeOnWarning extends ClientError {
  name = "PrivateModeOnWarning";

  constructor(prefix: string) {
    super(
      `Spotify private mode is on! This prevents Gowon from showing information that may reveal your Spotify profile.\n\nTo disable it see \`${prefix}sprivacy\``
    );
  }
}
