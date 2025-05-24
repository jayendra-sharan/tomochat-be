import gql from "graphql-tag";

export const messageTypeDefs = gql`
  type MessageStatus {
    isRead: Boolean!
    userId: ID!
  }

  type Message {
    id: ID!
    content: String!
    sender: User!
    room: Room!
    suggestion: Suggestion
    createdAt: String!
    perUserStatus: [MessageStatus!]!
  }
  type RoomMessages {
    messages: [Message!]!
    name: String!
    id: ID!
    userId: ID!
  }

  type Suggestion {
    isMessageOk: Boolean!
    original: String!
    fixedMessage: String
    fixLogic: String
  }

  input RoomMessagesInput {
    roomId: ID!
  }

  input SendMessageInput {
    roomId: String!
    content: String!
    isPrivate: Boolean
    displayName: String!
  }

  input ClearRoomMessagesInput {
    roomId: ID!
  }

  extend type Query {
    roomMessages(input: RoomMessagesInput!): RoomMessages!
  }

  extend type Mutation {
    sendMessage(input: SendMessageInput!): Message!
    clearRoomMessages(input: ClearRoomMessagesInput!): Boolean!
  }
`;
