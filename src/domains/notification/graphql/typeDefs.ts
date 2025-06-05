import { gql } from "graphql-tag";

export const notificationTypeDefs = gql`
  input RegisterPushTokenInput {
    token: String!
    platform: String! # 'expo', 'fcm-web', etc.
  }

  input SendTestNotificationInput {
    userId: String!
  }

  extend type Mutation {
    registerPushToken(input: RegisterPushTokenInput!): Boolean!
    sendTestNotification(input: SendTestNotificationInput!): Boolean!
  }
`;
