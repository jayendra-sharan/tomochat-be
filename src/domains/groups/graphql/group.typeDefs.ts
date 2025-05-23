import gql from "graphql-tag";

export const groupTypeDefs = gql`
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
    lastMessage: String
    isUnread: Boolean
  }

  input CreateGroupInput {
    name: String!
    groupType: String!
    topic: String!
  }

  input JoinGroupByInviteLinkInput {
    inviteLink: String!
  }

  extend type Query {
    groups: [Group!]!
  }

  extend type Mutation {
    createGroup(input: CreateGroupInput!): Group!
    joinGroupByInviteLink(input: JoinGroupByInviteLinkInput): Group!
  }
`;