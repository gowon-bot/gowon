import { Crown } from "../../database/entity/Crown";
import { CrownEvent } from "../../database/entity/meta/CrownEvent";
import { User } from "../../database/entity/User";

export default {
  queries: {
    async crown(_: any, args: { id: number }) {
      return await Crown.findOne({ where: args, withDeleted: true });
    },

    async crownsByUser(_: any, args: { discordID?: string }) {
      if (!args.discordID) return [];

      let user = await User.findOne(args);

      return await Crown.find({
        where: { user },
        order: {
          plays: "DESC",
        },
      });
    },

    async crownsByServer(_: any, args: { serverID: string }) {
      return await Crown.find({
        where: { serverID: args.serverID },
        order: {
          plays: "DESC",
        },
      });
    },

    async crownHistory(_: any, args: { crownID: number }) {
      return await CrownEvent.find({
        where: { crown: { id: args.crownID } },
        order: {
          happenedAt: "DESC",
        },
      });
    },
  },
};
