import express from "express";
import { ApolloServer, Config } from "apollo-server-express";
import { typeDefs } from "./graphql/schema.gql";
import userResolvers from "./resolvers/userResolvers";
import { IndexingWebhookService } from "./indexing/IndexingWebhookService";
import bodyParser from "body-parser";

export class GraphQLAPI {
  async init() {
    const app = express();

    const config: Config = {
      typeDefs,
      resolvers: {
        Query: {
          ping: () => "Pong!",
        },
        Mutation: {
          ...userResolvers.mutations,
        },
      },
      introspection: true,
      playground: true,
    };

    const server = new ApolloServer(config);
    await server.start();

    server.applyMiddleware({ app });

    app.use("/api", bodyParser.json());

    app.post("/api/indexingWebhook", (req, res) => {
      const body = req.body as { data?: { token?: string } };

      if (body?.data?.token) {
        IndexingWebhookService.getInstance().handleRequest(body.data.token);
        res.status(200).send();
      } else {
        res.status(400).send("Please send a token in valid json format");
      }
    });

    app.listen(6767, () => {
      console.log("Gowon API running at http://localhost:6767");
    });
  }
}
