import "cross-fetch/polyfill";
import { ApolloClient, InMemoryCache } from "@apollo/client/core";

export const mirrorballClient = new ApolloClient({
  uri: "http://localhost:8080/graphql",
  cache: new InMemoryCache(),
});
