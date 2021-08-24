import { User } from "../../database/entity/User";

export default {
  queries: {},

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
