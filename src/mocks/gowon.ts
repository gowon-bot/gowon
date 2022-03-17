import { DeepPartial } from "typeorm";
import { User } from "../database/entity/User";

export const mockEntities = {
  user(overrides: DeepPartial<User> = {}) {
    return User.create({
      lastFMUsername: "flushed_emoji",
      ...overrides,
    });
  },
};
