import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  split,
} from "@apollo/client";
import { create as createAbsintheSocket } from "@absinthe/socket";
import { createAbsintheSocketLink } from "@absinthe/socket-apollo-link";
import WebSocket from "ws";
import { DocumentNode } from "graphql";
import { Socket as PhoenixSocket } from "phoenix";

const absintheSocket = createAbsintheSocket(
  new PhoenixSocket("ws://host.docker.internal:4000/socket", {
    transport: WebSocket,
  })
);

const websocketLink = createAbsintheSocketLink(absintheSocket);
const httpLink = createHttpLink({
  uri: "http://host.docker.internal:4000/graphql",
});

const link = split(
  (operation) => hasSubscription(operation.query),
  websocketLink as any,
  httpLink
);

export const lilacClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

// Credit to https://github.com/jumpn/utils-graphql
function hasSubscription(documentNode: DocumentNode): boolean {
  return documentNode.definitions.some(
    (definition) =>
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
  );
}
