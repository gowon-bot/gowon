import "cross-fetch/polyfill";
import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import config from "../../../config.json";

export const mirrorballClient = new ApolloClient({
  uri: config.mirrorballURL,
  cache: new InMemoryCache(),
  headers: {
    Authorization: config.mirrorballPassword,
  },
});
