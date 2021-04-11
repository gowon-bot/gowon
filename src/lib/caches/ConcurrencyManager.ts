export enum ConcurrentActions {
  Indexing = "Indexing",
  Updating = "Updating",
}

interface ConcurrencyCache {
  [action: string]: Set<string>;
}

export class ConcurrencyManager {
  cache: ConcurrencyCache = {};

  constructor() {
    for (const action of Object.values(ConcurrentActions)) {
      this.cache[action] = new Set();
    }
  }

  async registerUser(action: ConcurrentActions, discordID: string) {
    this.cache[action].add(discordID);
  }

  unregisterUser(action: ConcurrentActions, discordID: string) {
    this.cache[action].delete(discordID);
  }

  async isUserDoingAction(
    discordID: string,
    ...actions: ConcurrentActions[]
  ): Promise<boolean> {
    return actions.some((action) => {
      return this.cache[action].has(discordID);
    });
  }
}
