import { User } from "../../database/entity/User";

export default {
  queries: {
    async user(_: any, args: { id: number }) {
      return await User.findOne(args);
    },

    async userByDiscordID(_: any, args: { discordID: string }) {
      return await User.findOne(args);
    },

    async users(_: any, args: { serverID: string }) {
      return await User.find(args);
    },
  },
};
