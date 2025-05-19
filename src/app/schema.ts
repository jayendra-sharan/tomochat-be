import { createSchema } from "graphql-yoga";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge"

import { authTypeDefs } from "@/domains/auth/graphql/auth.typeDefs";
import { groupTypeDefs } from "@/domains/groups/graphql/group.typeDefs";
import { messageTypeDefs } from "@/domains/chat/graphql/message.typeDefs";

import { authResolvers } from "@/domains/auth/graphql/auth.resolvers";
import { groupResolvers } from "@/domains/groups/graphql/group.resolver";
import { messageResolvers } from "@/domains/chat/graphql/message.resolvers";
import { sharedResolvers } from "@/domains/shared/graphql/shared.resolvers";
import { GraphQLContext } from "./context";
import { rootTypeDefs } from "@/domains/shared/graphql/root.typeDefs";
import { roomsTypeDefs } from "@/domains/rooms/graphql/rooms.typeDefs";
import { roomsResolvers } from "@/domains/rooms/graphql/rooms.resolver";

export const schema = createSchema<GraphQLContext>({
  typeDefs: mergeTypeDefs([
    rootTypeDefs,
    roomsTypeDefs,
    authTypeDefs,
    groupTypeDefs,
    messageTypeDefs,
  ]),
  resolvers: mergeResolvers([
    authResolvers,
    roomsResolvers,
    groupResolvers,
    messageResolvers,
    sharedResolvers,
  ])
});
