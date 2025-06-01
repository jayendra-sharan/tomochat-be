import gql from "graphql-tag";

export const userTypeDefs = gql`
  type UserProfile {
    id: ID!
    userId: ID!
    fullName: String
    location: String
    avatarUrl: String
    bio: String
  }

  type UserConnection {
    id: ID!
    userA: User!
    userB: User!
    createdAt: String!
  }

  type UserContact {
    id: ID!
    displayName: String!
    createdAt: String
  }

  input CreateUserProfileInput {
    fullName: String
    location: String
    avatarUrl: String
    bio: String
  }
  input UpdateUserProfileInput {
    fullName: String
    location: String
    avatarUrl: String
    bio: String
  }
  input CreateUserConnectionInput {
    userAId: ID!
    userBId: ID!
  }

  extend type Query {
    getMyProfile: UserProfile
    getUserConnections: [UserContact!]!
  }

  extend type Mutation {
    createUserConnection(input: CreateUserConnectionInput!): UserConnection!
    createUserProfile(input: CreateUserProfileInput!): UserProfile
    updateUserProfile(input: UpdateUserProfileInput!): UserProfile
  }
`;
