import { gql } from 'graphql-tag';

export const notificationTypeDefs = gql`
  input RegisterPushTokenInput {
    token: String!
    platform: String! # 'expo', 'fcm-web', etc.
  }

  extend type Mutation {
    registerPushToken(input: RegisterPushTokenInput!): Boolean!
  }
`;
