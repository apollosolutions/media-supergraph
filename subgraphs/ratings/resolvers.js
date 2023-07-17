import { RATINGS } from "./data.js";

export const ratingById = (id) => RATINGS.find((it) => it.contentId === id);

export const resolvers = {
  Query: {
    ratingById: (_, { id }) => ratingById(id),
  },
  Rating: {
    __resolveReference(ref) {
      return ratingById(ref.id);
    },
  },
};
