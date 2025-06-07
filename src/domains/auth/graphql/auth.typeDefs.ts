import { gql } from "graphql-tag";

export const authTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    displayName: String!
    userType: String!
    rooms: [Room!]!
    createdAt: String!
    updatedAt: String!
  }

  type Auth {
    token: String!
    user: User!
  }

  input CreateUserInput {
    idToken: String!
    displayName: String!
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

  input ChangePasswordInput {
    currentPassword: String!
    newPassword: String!
  }

  input RequestPasswordResetInput {
    email: String!
  }

  input RecoverPasswordInput {
    password: String
    token: String
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
    requestEmailVerification(input: RequestEmailVerificationInput!): Boolean!
    verifyEmailCode(input: VerifyEmailCodeInput!): Auth!
    changePassword(input: ChangePasswordInput!): Boolean!
    requestPasswordReset(input: RequestPasswordResetInput!): Boolean!
    recoverPassword(input: RecoverPasswordInput!): Boolean!
  }
`;
