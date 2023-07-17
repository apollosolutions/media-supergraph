import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { getMediaSchema } from "./media/subgraph.js";
import { getUsersSchema } from "./users/subgraph.js";
import { getSearchSchema } from "./search/subgraph.js";
import { getRatingSchema } from "./ratings/subgraph.js";
import { getCommentsSchema } from "./comments/subgraph.js";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import {getTrendingSchema} from "./trending/subgraph.js";

export const LOCAL_SUBGRAPH_CONFIG = [
  {
    name: "comments",
    getSchema: getCommentsSchema,
  },
  {
    name: "media",
    getSchema: getMediaSchema,
  },
  {
    name: "ratings",
    getSchema: getRatingSchema,
  },
  {
    name: "search",
    getSchema: getSearchSchema,
  },
  {
    name: "trending",
    getSchema: getTrendingSchema,
    subscriptions: true,
  },
  {
    name: "users",
    getSchema: getUsersSchema,
  },
];

const getLocalSubgraphConfig = (subgraphName) =>
  LOCAL_SUBGRAPH_CONFIG.find((it) => it.name === subgraphName);

const getSubscriptionShutdownPlugin = (serverCleanup, subscriptionsEnabled) => ({
  async serverWillStart() {
    return {
      async drainServer() {
        if (serverCleanup && subscriptionsEnabled === true) {
          await serverCleanup.dispose();
        }
      },
    };
  },
});

export const startSubgraphs = async (httpPort) => {
  // Create a monolith express app for all subgraphs
  const app = express();
  const httpServer = http.createServer(app);
  const serverPort = process.env.PORT ?? httpPort;

  // Run each subgraph on the same http server, but at different paths
  for (const subgraph of LOCAL_SUBGRAPH_CONFIG) {
    const subgraphConfig = getLocalSubgraphConfig(subgraph.name);
    const schema = subgraphConfig.getSchema();
    const path = `/${subgraphConfig.name}/graphql`;
    const wsPath = `/${subgraphConfig.name}/ws`;

    // Optionally setup subscriptions for this subgraph
    let serverCleanup = undefined;
    if (subgraphConfig.subscriptions === true) {
      const wsServer = new WebSocketServer({
        server: httpServer,
        path: wsPath,
      });
      serverCleanup = useServer({ schema }, wsServer);
    }

    const server = new ApolloServer({
      schema,
      // For a real subgraph introspection should remain off, but for demo we enabled
      introspection: true,
      plugins: [
        ApolloServerPluginDrainHttpServer({ httpServer }),
        getSubscriptionShutdownPlugin(serverCleanup, subgraphConfig.subscriptions)
      ],
    });

    await server.start();

    app.use(
      path,
      cors(),
      bodyParser.json(),
      expressMiddleware(server, {
        context: async ({ req }) => ({ headers: req.headers }),
      })
    );

    console.log(
      `Setting up [${subgraphConfig.name}] subgraph at http://localhost:${serverPort}${path}`
    );

    if (subgraphConfig.subscriptions === true) {
      console.log(
        `Setting up [${subgraphConfig.name}] subgraph SUBSCRIPTIONS at ws://localhost:${serverPort}${wsPath}`
      );
    }
  }

  // Start entire monolith at given port
  await new Promise((resolve) =>
    httpServer.listen({ port: serverPort }, resolve)
  );
};
