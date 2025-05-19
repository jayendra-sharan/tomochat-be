// @TODO - rename table in database to ROOM
import gql from "graphql-tag";

export const roomsTypeDefs = gql`

  type Member {
    id: ID!
    user: User!
    role: String!
    room: Group!
    joinedAt: String!
  }

  type Room {
    id: ID!
    name: String!
    groupType: String!
    topic: String!
    inviteLink: String!
    members: [Member!]!
    adminUserIds: [ID!]!
    createdAt: String
    updatedAt: String
    lastMessage: String
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

  extend type Query {
    rooms: [Group!]!
  }

  extend type Mutation {
    createRoom(input: CreateRoomInput!): Room!
    joinRoom(input: JoinRoomInput!): JoinRoomResponse
  }
`;
