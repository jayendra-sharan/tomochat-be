import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge"

import { authTypeDefs } from "@/domains/auth/graphql/auth.typeDefs";
import { messageTypeDefs } from "@/domains/chat/graphql/message.typeDefs";

import { authResolvers } from "@/domains/auth/graphql/auth.resolvers";
import { messageResolvers } from "@/domains/chat/graphql/message.resolvers";
import { sharedResolvers } from "@/domains/shared/graphql/shared.resolvers";
import { GraphQLContext } from "./context";
import { rootTypeDefs } from "@/domains/shared/graphql/root.typeDefs";
import { roomsTypeDefs } from "@/domains/rooms/graphql/rooms.typeDefs";
import { roomsResolvers } from "@/domains/rooms/graphql/rooms.resolver";
import { notificationTypeDefs } from "@/domains/notification/graphql/typeDefs";
import { notificationResolvers } from "@/domains/notification/graphql/resolver";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { userTypeDefs } from "@/domains/user/graphql/user.typeDefs";
import { userResolvers } from "@/domains/user/graphql/user.resolvers";

export const schema = makeExecutableSchema<GraphQLContext>({
  typeDefs: mergeTypeDefs([
    rootTypeDefs,
    roomsTypeDefs,
    authTypeDefs,
    messageTypeDefs,
    notificationTypeDefs,
    userTypeDefs,
  ]),
  resolvers: mergeResolvers([
    authResolvers,
    roomsResolvers,
    messageResolvers,
    notificationResolvers,
    userResolvers,
    sharedResolvers,
  ])
});
