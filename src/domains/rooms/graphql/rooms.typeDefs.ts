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
    description: String
    inviteLink: String!
    members: [RoomMember!]!
    adminUserIds: [ID!]!
    createdAt: String
    updatedAt: String
    lastMessage: String
    lastMessageAt: String
    isUnread: Boolean
    messageCount: Int
  }

  input CreateRoomInput {
    name: String!
    language: String
    userDisplayName: String
    description: String
  }

  input JoinRoomInput {
    inviteLink: String!
  }

  type JoinRoomResponse {
    result: Boolean
  }

  input DeleteRoomInput {
    roomId: String!
  }

  input LeaveRoomInput {
    roomId: String!
  }

  input ClearGroupMessagesInput {
    roomId: String!
  }

  input GetRoomDetailsInput {
    roomId: String!
  }

  input AddMembersToRoomInput {
    roomId: String!
    memberIds: [String!]!
  }

  input MakeUserAdminInput {
    roomId: String!
    memberId: String!
  }

  extend type Query {
    getRoomDetails(input: GetRoomDetailsInput): Room!
    rooms: [Room!]!
  }

  extend type Mutation {
    createRoom(input: CreateRoomInput!): Room!
    joinRoom(input: JoinRoomInput!): JoinRoomResponse
    deleteRoom(input: DeleteRoomInput!): Boolean!
    leaveRoom(input: LeaveRoomInput!): Boolean!
    clearGroupMessages(input: ClearGroupMessagesInput!): Boolean!
    addMembersToRoom(input: AddMembersToRoomInput!): Room!
    makeUserAdmin(input: MakeUserAdminInput): Boolean!
  }
`;
