import "cross-fetch/polyfill";
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import config from "../../../config.json";

export const mirrorballClient = new ApolloClient({
  uri: "http://localhost:8080/graphql",
  cache: new InMemoryCache(),
  headers: {
    Authorization: config.mirrorballPassword,
  },
});
