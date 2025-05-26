import gql from "graphql-tag";

export const userTypeDefs = gql`
  type UserConnection {
    id: ID!
    userA: User!
    userB: User!
    createdAt: String!
  }

  type UserContact {
    id: ID!
    displayName: String!
    email: String!
  }

  input CreateUserConnectionInput {
    userAId: ID!
    userBId: ID!
  }

  extend type Query {
    getUserConnections: [UserContact!]!
  }

  extend type Mutation {
    createUserConnection(input: CreateUserConnectionInput!): UserConnection!
  }
`;

