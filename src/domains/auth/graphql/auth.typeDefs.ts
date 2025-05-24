import { gql } from 'graphql-tag';

export const authTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    displayName: String!
    userType: String!
    rooms: [Room!]!
    createdAt: String!
    updatedAt: String!
    isEmailVerified: Boolean!
  }

  type Auth {
    token: String!
    user: User!
  }

  input CreateUserInput {
    email: String!
    displayName: String!
    password: String!
    userType: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input RequestEmailVerificationInput {
    email: String!
  }

  extend type Query {
    me: User!
    login(input: LoginInput!): Auth
  }

  input VerifyEmailCodeInput {
    email: String!
    code: String!
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    requestEmailVerification(input: RequestEmailVerificationInput!): Boolean!
    verifyEmailCode(input: VerifyEmailCodeInput!): Auth!
  }
`;
