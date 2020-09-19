import express from "express";
import { ApolloServer, Config } from "apollo-server-express";
import { UsersService } from "../services/dbservices/UsersService";
import { typeDefs } from "./graphql/schema.gql";
import userResolvers from "./resolvers/userResolvers";
import crownResolvers from "./resolvers/crownResolvers";
import redirectResolvers from "./resolvers/redirectResolvers";

export class GraphQLAPI {
  usersService = new UsersService();

  async init() {
    const app = express();

    const config: Config = {
      typeDefs,
      resolvers: {
        Query: {
          ...userResolvers.queries,
          ...crownResolvers.queries,
          ...redirectResolvers.queries,
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
      cors: {
        origin: "http://localhost:3001",
      },
    });

    app.listen(3000, () => {
      console.log("Gowon GraphQL API running at http://localhost:3000/graphql");
    });
  }
}
