import { GraphQLError } from "graphql";

export class BaseError extends GraphQLError {
  constructor(message: string, code: string, extensions?: Record<string, any>) {
    super(message, {
      extensions: {
        code,
        ...extensions,
      },
    });
  }
}
