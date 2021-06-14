import { DiscordService } from "../../services/Discord/DiscordService";

export interface SimpleUser {
  discordID: string;
  username: string;
  avatarURL: string;
}

const discordService = new DiscordService();

export default {
  queries: {},

  mutations: {
    async discordAuthenticate(
      _: any,
      args: { code: string }
    ): Promise<SimpleUser> {
      const accessToken = await discordService.getAccessToken(args.code);
      const user = await discordService.getUser(accessToken.access_token);

      return user;
    },
  },
};
