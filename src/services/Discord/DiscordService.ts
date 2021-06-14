import { URLSearchParams } from "url";
import { BaseService } from "../BaseService";
import { SimpleUser } from "../../api/resolvers/userResolvers";
import config from "../../../config.json";
import fetch from "node-fetch";

export interface DiscordOAuthToken {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token: string;
  scope: string;
}

export class DiscordService extends BaseService {
  private readonly baseURL = "https://discord.com/api";

  async getAccessToken(code: string): Promise<DiscordOAuthToken> {
    const response = await fetch(`${this.baseURL}/oauth2/token`, {
      body: new URLSearchParams({
        client_secret: config.discordClientSecret,
        client_id: config.discordClientID,
        grant_type: "authorization_code",
        redirect_uri: config.discordRedirectURL,
        code,
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    return await response.json();
  }

  async getUser(token: string): Promise<SimpleUser> {
    const response = await fetch(`${this.baseURL}/users/@me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const jsonResponse = await response.json();

    return {
      discordID: jsonResponse.id,
      username: jsonResponse.username,
      avatarURL: `https://cdn.discordapp.com/avatars/${jsonResponse.id}/${
        jsonResponse.avatar
      }.${jsonResponse?.avatar?.startsWith("a_") ? "gif" : "png"}`,
    };
  }
}
