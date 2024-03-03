export class CannotSwitchToTabError extends Error {
  constructor() {
    super(`Couldn't find a tab to switch to!`);
  }
}

export class NoMessageToReactToError extends Error {
  constructor() {
    super(`There is no message to react to!`);
  }
}

export class ViewHasNotBeenSentError extends Error {
  constructor() {
    super(`This view has not been sent yet!`);
  }
}

export class ViewCannotBeSentError extends Error {
  constructor() {
    super("This view cannot be sent!");
  }
}
