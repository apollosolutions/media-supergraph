import { MEDIA } from "../media/data.js";
import { USERS } from "../users/data.js";
import { v4 as uuidv4 } from "uuid";

const getUserById = (id) => USERS.find((user) => user.id === id);

export const getResultByText = (text) => {
  let results = [];

  if (!text) return results;

  MEDIA.forEach((media) => {
    if (media.title.includes(text))
      results.push({ ...media, __typename: "Media" });
  });

  USERS.forEach((user) => {
    if (user.username.includes(text))
      results.push({ ...user, __typename: "User" });
  });

  return results;
};

export const resolvers = {
  Query: {
    search: (_, { text }) => {
      return {
        text: text,
        results: getResultByText(text),
      };
    },
  },
  User: {
    __resolveReference(ref) {
      return getUserById(ref.id);
    },
  },
};
