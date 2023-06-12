import { RATINGS } from "./data.js";

export const getRatingById = (id) => RATINGS.find((it) => it.contentId === id);

export const resolvers = {
  Query: {
    getRatingById: (_, { id }) => getRatingById(id),
  },
  Rating: {
    __resolveReference(ref) {
      return getRatingById(ref.id);
    },
  },
};
