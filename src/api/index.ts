import { ApolloServer, Config, CorsOptions } from "apollo-server-express";
import bodyParser from "body-parser";
import express from "express";
import morgan from "morgan";
import gowonConfig from "../../config.json";
import { AnalyticsCollector } from "../analytics/AnalyticsCollector";
import { GowonClient } from "../lib/GowonClient";
import { HeaderlessLogger } from "../lib/Logger";
import { GowonContext } from "../lib/context/Context";
import { Payload } from "../lib/context/Payload";
import { ServiceRegistry } from "../services/ServicesRegistry";
import {
  InvalidStateError,
  SpotifyCodeResponse,
} from "../services/Spotify/SpotifyService.types";
import { typeDefs } from "./graphql/schema.gql";
import commandResolvers from "./resolvers/commandResolvers";
import discordResolvers from "./resolvers/discordResolvers";
import settingsResolvers from "./resolvers/settings/settingResolvers";
import userResolvers from "./resolvers/userResolvers";
import { SpotifyWebhookService } from "./webhooks/SpotifyWebhookService";

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

    app.use(morgan("tiny"));

    const corsOptions: CorsOptions = {
      origin: gowonConfig.gowonWebsiteURL,
    };

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

    server.applyMiddleware({ app, cors: corsOptions });

    app.use("/api", bodyParser.json());

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
