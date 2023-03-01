import { ApolloServer, Config } from "apollo-server-express";
import bodyParser from "body-parser";
import express from "express";
import gowonConfig from "../../config.json";
import { AnalyticsCollector } from "../analytics/AnalyticsCollector";
import { ServiceRegistry } from "../services/ServicesRegistry";
import {
  InvalidStateError,
  SpotifyCodeResponse,
} from "../services/Spotify/SpotifyService.types";
import { typeDefs } from "./graphql/schema.gql";
import { IndexingWebhookService } from "./webhooks/IndexingWebhookService";
import { SpotifyWebhookService } from "./webhooks/SpotifyWebhookService";

import { GowonContext } from "../lib/context/Context";
import { GowonClient } from "../lib/GowonClient";
import { HeaderlessLogger } from "../lib/Logger";
import commandResolvers from "./resolvers/commandResolvers";
import discordResolvers from "./resolvers/discordResolvers";
import settingsResolvers from "./resolvers/settingResolvers";
import userResolvers from "./resolvers/userResolvers";

import { Payload } from "../lib/context/Payload";

export const gowonAPIPort = gowonConfig.gowonAPIPort;

export class GraphQLAPI {
  analyticsCollector = ServiceRegistry.get(AnalyticsCollector);

  private readonly spotifyRedirectRoute = "/spotify-login-success";

  constructor(private gowonClient: GowonClient) {}

  get ctx(): GowonContext {
    const ctx = new GowonContext({
      gowonClient: this.gowonClient,
      payload: new Payload({} as any),
    } as any);

    ctx.dangerousSetCommand({ logger: new HeaderlessLogger() });

    return ctx;
  }

  async init() {
    const app = express();

    const config: Config = {
      typeDefs,
      resolvers: {
        Query: {
          ...commandResolvers(this.ctx).queries,
          ...settingsResolvers(this.ctx).queries,
          ...discordResolvers(this.ctx).queries,
        },
        Mutation: {
          ...userResolvers.mutations,
          ...settingsResolvers(this.ctx).mutations,
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
