import { MEDIA } from "../media/data.js";

import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();

export const getMediaById = (id) => MEDIA.find((it) => it.id === id);

const trendingMedia = () => {
  const randomIndex = Math.floor(Math.random() * 3);
  pubsub.publish("MEDIA_TRENDING", { trendingMedia: MEDIA[randomIndex] });
  setTimeout(trendingMedia, 1000);
};

// Start random trending media selection
trendingMedia();

export const resolvers = {
  Subscription: {
    trendingMedia: {
      subscribe: () => pubsub.asyncIterator(["MEDIA_TRENDING"]),
    },
  },
};
