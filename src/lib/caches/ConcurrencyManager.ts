import { RedisService } from "../../services/RedisService";

export enum ConcurrentActions {
  Indexing = "Indexing",
  Updating = "Updating",
}

export class ConcurrencyManager {
  redisService = new RedisService();

  async registerUser(action: ConcurrentActions, discordID: string) {
    await this.redisService.set(
      discordID + action,
      this.redisService.encodeDate(new Date())
    );
  }

  unregisterUser(action: ConcurrentActions, discordID: string) {
    this.redisService.delete(discordID + action);
  }

  async isUserDoingAction(
    discordID: string,
    ...actions: ConcurrentActions[]
  ): Promise<boolean> {
    const result = await Promise.all(
      actions.map((a) => this.redisService.get(discordID + a))
    );

    return !!result.filter((a) => a).length;
  }
}
