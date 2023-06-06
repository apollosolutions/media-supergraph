import { SEARCH } from "./data.js";

export const getResultById = (id) => SEARCH.find((it) => it.id === id);

export const resolvers = {
  Query: {
    search: (_, { id }) => getResultById(id),
  },
  SEARCH: {
    __resolveReference(ref) {
      return getResultById(ref.id);
    },
    content: () => {},
  },
};
