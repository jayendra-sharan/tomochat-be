import { createSchema } from "graphql-yoga";
import { resolvers } from "../resolvers";

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type User {
      id: ID!
      email: String!
      displayName: String!
      userType: String!
      groups: [Group!]!
      createdAt: String!
      updatedAt: String!
    }

    input CreateUserInput {
      email: String!
      displayName: String!
      password: String!
      userType: String!
    }

    type AuthPayload {
      token: String!
      user: User!
    }

    input LoginInput {
      email: String!
      password: String!
    }
   
    input CreateGroupInput {
      name: String!
      groupType: String!
      topic: String!
    }

    type GroupMember {
      id: ID!
      user: User!
      role: String!
      group: Group!
      joinedAt: String!
    }

    type Group {
      id: ID!
      name: String!
      groupType: String!
      topic: String!
      inviteLink: String!
      members: [GroupMember!]!
      adminUserIds: [ID!]!
      createdAt: String
      updatedAt: String
    }

    type Suggestion {
      original: String!
      aiReply: String!
      english: String!
      improved: String
      issues: [String!]!
    }

    type Message {
      id: ID!
      content: String!
      sender: User!
      group: Group!
      suggestion: Suggestion
      createdAt: String!
    }

    input JoinGroupByInviteLinkInput {
      inviteLink: String!
    }

    input SendMessageInput {
      groupId: String!
      content: String!
    }

    type Query {
      me: User!
      login(input: LoginInput!): AuthPayload
      users: [User!]!
      groups: [Group!]!
      messages(groupId: ID!): [Message!]!
      myGroups: [Group!]!
    }

    input ClearGroupMessagesInput {
      groupId: String!
    }

    type Mutation {
      createUser(input: CreateUserInput!): User!
      createGroup(input: CreateGroupInput!): Group!
      joinGroupByInviteLink(input: JoinGroupByInviteLinkInput!): Group!
      joinGroup(userId: ID!, groupId: ID!): Group!
      sendMessage(input: SendMessageInput!): Message!
      clearGroupMessages(input: ClearGroupMessagesInput!): Boolean!
    }
  `,
  resolvers,
});
