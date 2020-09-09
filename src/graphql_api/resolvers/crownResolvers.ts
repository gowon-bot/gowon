import { Crown } from "../../database/entity/Crown";
import { User } from "../../database/entity/User";

export default {
  queries: {
    async crown(_: any, args: { id: number }) {
      return await Crown.findOne(args);
    },

    async crownsByUser(_: any, args: { discordID: string }) {
      let user = await User.findOne(args);

      return await Crown.find({
        where: { user },
        order: {
          plays: "DESC",
        },
      });
    },

    async crownsByServer(_: any, args: { serverID: string }) {
      return await Crown.find(args);
    },
  },
};
