// @TODO - rename table in database to ROOM
import gql from "graphql-tag";

export const roomsTypeDefs = gql`
  type RoomMember {
    id: ID!
    user: User!
    role: String!
    room: Room!
    joinedAt: String!
  }

  type Room {
    id: ID!
    name: String!
    roomType: String!
    topic: String!
    inviteLink: String!
    members: [RoomMember!]!
    adminUserIds: [ID!]!
    createdAt: String
    updatedAt: String
    lastMessage: String
    isUnread: Boolean
    messageCount: Int
  }

  input CreateRoomInput {
    name: String!
    language: String
    userDisplayName: String
  }

  input JoinRoomInput {
    inviteLink: String!
  }

  type JoinRoomResponse {
    result: Boolean
  }

  input DeleteGroupInput {
    roomId: String!
  }

  input ClearGroupMessagesInput {
    roomId: String!
  }

  input GetRoomDetailsInput {
    roomId: String!
  }

  extend type Query {
    getRoomDetails(input: GetRoomDetailsInput): Room!
    rooms: [Room!]!
  }

  extend type Mutation {
    createRoom(input: CreateRoomInput!): Room!
    joinRoom(input: JoinRoomInput!): JoinRoomResponse
    deleteGroup(input: DeleteGroupInput!): Boolean!
    clearGroupMessages(input: ClearGroupMessagesInput!): Boolean!
  }
`;
