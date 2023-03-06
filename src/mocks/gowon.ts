import { DeepPartial } from "typeorm";
import { User } from "../database/entity/User";
import { GowonClient } from "../lib/GowonClient";
import { mockClient } from "./discord";

export const mockEntities = {
  gowonClient: new GowonClient(mockClient, "test"),

  user(overrides: DeepPartial<User> = {}) {
    return User.create({
      lastFMUsername: "flushed_emoji",
      ...overrides,
    });
  },
};
