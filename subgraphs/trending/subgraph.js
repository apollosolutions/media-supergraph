import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createServer } from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import bodyParser from "body-parser";
import cors from "cors";
import { readFileSync } from "fs";
import { parse } from "graphql";
import { resolvers } from "./resolvers.js";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const port = 4002;

const __dirname = dirname(fileURLToPath(import.meta.url));
const typeDefs = parse(
  readFileSync(resolve(__dirname, "schema.graphql"), "utf8")
);

// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.

// const schema = makeExecutableSchema({ typeDefs, resolvers });
const schema = buildSubgraphSchema({ typeDefs, resolvers });

// Create an Express app and HTTP server; we will attach both the WebSocket
// server and the ApolloServer to this HTTP server.
const app = express();
const httpServer = createServer(app);

// Create our WebSocket server using the HTTP server we just set up.
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/subscription",
});
// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({ schema }, wsServer);

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

export const startSubgraph = async () => {
  await server.start();
  app.use("/graphql", cors(), bodyParser.json(), expressMiddleware(server));

// Now that our HTTP server is fully set up, we can listen to it.
  httpServer.listen(port, () => {
    console.log(
      `Trending Server is now running on http://localhost:${port}/graphql`
    );
    console.log(
      `Trending subscriptions now running on http://localhost:${port}/subscription`
    );
  });
};
