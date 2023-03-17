import { DeepPartial } from "typeorm";
import { User } from "../database/entity/User";
import { GowonClient } from "../lib/GowonClient";
import { mockClient } from "./discord";

export const mockEntities = {
  gowonClient: new GowonClient(mockClient, "test"),

  user(overrides: DeepPartial<User> = {}): User {
    return {
      id: 13,
      discordID: "537353774205894676",
      lastFMUsername: "chuu-bot",
      ...overrides,
    } as User;
  },
};
