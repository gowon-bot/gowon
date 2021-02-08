import { User } from "../../database/entity/User";

export default {
  queries: {
    async user(_: any, args: { id: number }) {
      return await User.findOne(args);
    },

    async userByDiscordID(_: any, args: { discordID: string }) {
      return await User.findOne(args);
    },

    async users() {
      return await User.find();
    },
  },

  mutations: {
    async login(
      _: any,
      args: { code: string; discordID: string }
    ): Promise<User> {
      let user = await User.findOne({
        discordID: args.discordID,
      });

      if (!user) {
        user = User.create({
          discordID: args.discordID,
          discordAuthCode: args.code,
        });

        return await user.save();
      } else {
        user.discordAuthCode = args.code;
        return await user.save();
      }
    },
  },
};
