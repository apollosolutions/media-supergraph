import { buildSubgraphSchema } from "@apollo/subgraph";
import { readFileSync } from "fs";
import { parse } from "graphql";
import { resolvers } from "./resolvers.js";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const typeDefs = parse(
  readFileSync(resolve(__dirname, "schema.graphql"), "utf8")
);

export const getTrendingSchema = () =>
  buildSubgraphSchema({ typeDefs, resolvers });
