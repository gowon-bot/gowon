import express from "express";
import { ApolloServer, Config } from "apollo-server-express";
import { UsersService } from "../services/dbservices/UsersService";
import { typeDefs } from "./graphql/schema.gql";
import userResolvers from "./resolvers/userResolvers";
import commandResolversFunc from "./resolvers/commandResolvers";
import { IndexingWebhookService } from "./indexing/IndexingWebhookService";
import bodyParser from "body-parser";
import { CommandRegistry } from "../lib/command/CommandRegistry";

export const gowonAPIPort = 3000;

export class GraphQLAPI {
  usersService = new UsersService();
  commandRegistry = CommandRegistry.getInstance();

  async init() {
    await this.commandRegistry.init();

    const app = express();

    const commandResolvers = commandResolversFunc(this.commandRegistry);

    const config: Config = {
      typeDefs,
      resolvers: {
        Query: {
          ...commandResolvers.queries,
        },
        Mutation: {
          ...userResolvers.mutations,
        },
      },
      introspection: true,
      playground: true,
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

    app.listen(gowonAPIPort);
  }
}
