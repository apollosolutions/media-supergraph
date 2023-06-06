import { COMMENTS } from "./data.js";

export const getCommentsById = (id) => COMMENTS.find((it) => it.id === id);

export const resolvers = {
  Query: {
    userComments: (_, { id }) => getCommentsById(id),
  },
  COMMENTS: {
    __resolveReference(ref) {
      return getCommentsById(ref.id);
    },
    content: () => {},
  },
};
