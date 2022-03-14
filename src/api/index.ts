import express from "express";
import { ApolloServer, Config } from "apollo-server-express";
import { typeDefs } from "./graphql/schema.gql";
import { IndexingWebhookService } from "./webhooks/IndexingWebhookService";
import bodyParser from "body-parser";
import { ServiceRegistry } from "../services/ServicesRegistry";
import { AnalyticsCollector } from "../analytics/AnalyticsCollector";
import gowonConfig from "../../config.json";
import {
  InvalidStateError,
  SpotifyCodeResponse,
} from "../services/Spotify/SpotifyService.types";
import { SpotifyWebhookService } from "./webhooks/SpotifyWebhookService";

import userResolvers from "./resolvers/userResolvers";
import commandResolvers from "./resolvers/commandResolvers";
import settingsResolvers from "./resolvers/settingResolvers";
import { GowonClient } from "../lib/GowonClient";
import discordResolvers from "./resolvers/discordResolvers";
import { GowonContext } from "../lib/context/Context";
import { HeaderlessLogger } from "../lib/Logger";
import { TwitterWebhookService } from "./webhooks/TwitterWebhookService";

export const gowonAPIPort = gowonConfig.gowonAPIPort;

export class GraphQLAPI {
  analyticsCollector = ServiceRegistry.get(AnalyticsCollector);

  private readonly spotifyRedirectRoute = "/spotify-login-success";
  private readonly twitterRedirectRoute = "/twitter-login-success";

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

    app.get("/webhooks/spotify", (req, res) => {
      const body = req.query as any as SpotifyCodeResponse;

      if (body.state) {
        try {
          SpotifyWebhookService.getInstance().handleRequest(body);
          res.redirect(gowonConfig.gowonWebsiteURL + this.spotifyRedirectRoute);
        } catch (e) {
          if (e instanceof InvalidStateError) {
            res.send(
              "<p>Whoops, something is wrong with the link you clicked to get here! Try running <pre>!spotifylogin<pre> again to generate a new one.</p>"
            );
          } else {
            res.send("<p>Whoops, something went wrong...</p");
          }
        }
      } else {
        res.status(400).send("Please send a code in the valid format");
      }
    });

    app.get("/webhooks/twitter", (req, res) => {
      const response = {
        code: req.query.code as string,
        state: req.query.state as string,
      };

      if (response.state && response.code) {
        TwitterWebhookService.getInstance().handleRequest(response);
        res.redirect(gowonConfig.gowonWebsiteURL + this.twitterRedirectRoute);
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
