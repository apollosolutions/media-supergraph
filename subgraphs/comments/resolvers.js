import { COMMENTS } from "./data.js";

export const getComments = () => COMMENTS;

export const resolvers = {
  Query: {
    userComments: () => {
      return { comments: getComments() };
    },
  },
};
