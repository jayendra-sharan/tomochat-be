import { gql } from 'graphql-tag';

export const authTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    displayName: String!
    userType: String!
    groups: [Group!]!
    createdAt: String!
    updatedAt: String!
  }

  type Auth {
    token: String!
    user: User!
  }

  input CreateUserInput {
    email: String!
    displayName: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    me: User!
    login(input: LoginInput!): Auth
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
  }
`;
