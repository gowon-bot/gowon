export class CannotSwitchToTabError extends Error {
  name = "CannotSwitchToTabError";

  constructor() {
    super(`Couldn't find a tab to switch to!`);
  }
}

export class NoMessageToReactToError extends Error {
  name = "NoMessageToReactTo";

  constructor() {
    super(`There is no message to react to!`);
  }
}
