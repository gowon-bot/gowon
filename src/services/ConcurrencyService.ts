import { BaseService, BaseServiceContext } from "./BaseService";

export enum ConcurrentAction {
  Indexing = "Indexing",
  Updating = "Updating",
  RYMImport = "RYMImport",
}

interface ConcurrencyCache {
  [action: string]: Set<string>;
}

export class ConcurrencyService extends BaseService {
  readonly defaultTimeout = 10 * 60 * 60;

  cache: ConcurrencyCache = {};

  constructor() {
    super();
    for (const action of Object.values(ConcurrentAction)) {
      this.cache[action] = new Set();
    }
  }

  registerUser(
    ctx: BaseServiceContext,
    action: ConcurrentAction,
    discordID: string
  ) {
    this.log(ctx, `Registering user ${discordID} as doing ${action}`);
    this.cache[action].add(discordID);
    this.makeEphemeral(action, discordID);
  }

  unregisterUser(
    ctx: BaseServiceContext,
    action: ConcurrentAction,
    discordID: string
  ) {
    this.log(ctx, `Unregistering user ${discordID} as doing ${action}`);
    this.cache[action].delete(discordID);
  }

  async isUserDoingAction(
    discordID: string,
    ...actions: ConcurrentAction[]
  ): Promise<boolean> {
    return actions.some((action) => {
      return this.cache[action].has(discordID);
    });
  }

  private makeEphemeral(action: ConcurrentAction, discordID: string) {
    setTimeout(() => {
      this.cache[action].delete(discordID);
    }, this.defaultTimeout);
  }
}
