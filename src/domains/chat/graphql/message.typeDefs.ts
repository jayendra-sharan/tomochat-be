import gql from "graphql-tag";

export const messageTypeDefs = gql`
  type Message {
    id: ID!
    content: String!
    sender: User!
    group: Group!
    suggestion: Suggestion
    createdAt: String!
  }
  type GroupMessages {
    messages: [Message!]!
    name: String!
    id: ID!
    userId: ID!
  }

  type Suggestion {
    original: String!
    aiReply: String!
    english: String!
    improved: String
    issues: [String!]!
  }

  input GroupMessagesInput {
    groupId: ID!
  }

  input SendMessageInput {
    groupId: String!
    content: String!
    isPrivate: Boolean
    displayName: String!
  }

  input ClearGroupMessagesInput {
    groupId: ID!
  }

  extend type Query {
    groupMessages(input: GroupMessagesInput!): GroupMessages!
  }

  extend type Mutation {
    sendMessage(input: SendMessageInput!): Message!
    clearGroupMessages(input: ClearGroupMessagesInput!): Boolean!
  }
`;
