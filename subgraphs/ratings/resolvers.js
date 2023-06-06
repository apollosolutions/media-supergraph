import { RATINGS } from "./data.js";

export const getRatingById = (id) => RATINGS.find((it) => it.id === id);

export const resolvers = {
  Query: {
    rating: (_, { id }) => getRatingById(id),
  },
};
