import express from "express";
import { ApolloServer, Config } from "apollo-server-express";
import { typeDefs } from "./graphql/schema.gql";
import { IndexingWebhookService } from "./webhooks/IndexingWebhookService";
import bodyParser from "body-parser";
import { ServiceRegistry } from "../services/ServicesRegistry";
import { AnalyticsCollector } from "../analytics/AnalyticsCollector";
import gowonConfig from "../../config.json";
import { SpotifyCodeResponse } from "../services/Spotify/SpotifyService.types";
import { SpotifyWebhookService } from "./webhooks/SpotifyWebhookService";

import userResolvers from "./resolvers/userResolvers";
import commandResolvers from "./resolvers/commandResolvers";
import settingsResolvers from "./resolvers/settingResolvers";
import { GowonClient } from "../lib/GowonClient";
import discordResolvers from "./resolvers/discordResolvers";
import { GowonContext } from "../lib/context/Context";
import { HeaderlessLogger } from "../lib/Logger";

export const gowonAPIPort = gowonConfig.gowonAPIPort;

export class GraphQLAPI {
  analyticsCollector = ServiceRegistry.get(AnalyticsCollector);

  private readonly spotifyRedirectRoute = "/spotify-login-success";

  constructor(private gowonClient: GowonClient) {}

  async init() {
    const app = express();

    const ctx = new GowonContext({} as any);
    ctx.dangerousSetCommand({ logger: new HeaderlessLogger() });

    const config: Config = {
      typeDefs,
      resolvers: {
        Query: {
          ...commandResolvers.queries,
          ...settingsResolvers(this.gowonClient, ctx).queries,
          ...discordResolvers(this.gowonClient).queries,
        },
        Mutation: {
          ...userResolvers.mutations,
          ...settingsResolvers(this.gowonClient, ctx).mutations,
        },
      },
      introspection: true,
      playground: true,
      context: ({ req }) => {
        const doughnutID = req.headers["doughnut-discord-id"];

        return { doughnutID };
      },
    };

    const server = new ApolloServer(config);

    server.applyMiddleware({
      app,
      path: "/graphql",
    });

    app.use("/api", bodyParser.json());

    app.post("/api/indexingWebhook", (req, res) => {
      const body = req.body as { data?: { token?: string; error?: string } };

      if (body?.data?.token) {
        IndexingWebhookService.getInstance().handleRequest(
          body.data.token,
          body.data.error
        );
        res.status(200).send();
      } else {
        res.status(400).send("Please send a token in valid json format");
      }
    });

    app.get("/api/spotifyWebhook", (req, res) => {
      const body = req.query as any as SpotifyCodeResponse;

      if (body.state) {
        SpotifyWebhookService.getInstance().handleRequest(body);
        res.redirect(gowonConfig.gowonWebsiteURL + this.spotifyRedirectRoute);
      } else {
        res.status(400).send("Please send a code in the valid format");
      }
    });

    app.get(
      "/metrics",
      this.analyticsCollector.handler.bind(this.analyticsCollector)
    );

    app.post(
      "/metrics",
      this.analyticsCollector.handler.bind(this.analyticsCollector)
    );

    app.listen(gowonAPIPort);
  }
}
