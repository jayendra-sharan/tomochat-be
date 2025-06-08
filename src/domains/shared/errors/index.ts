import { BaseError } from "./BaseError";

export class UserInputError extends BaseError {
  constructor(message: string, extensions?: Record<string, any>) {
    super(message, "BAD_USER_INPUT", extensions);
  }
}

export class AuthenticationError extends BaseError {
  constructor(
    message = "Authentication required",
    extensions?: Record<string, any>
  ) {
    super(message, "UNAUTHENTICATED", extensions);
  }
}

export class AuthorizationError extends BaseError {
  constructor(message = "Not authorized", extensions?: Record<string, any>) {
    super(message, "FORBIDDEN", extensions);
  }
}

export class NotFoundError extends BaseError {
  constructor(
    message = "Resource not found",
    extensions?: Record<string, any>
  ) {
    super(message, "NOT_FOUND", extensions);
  }
}

export class ConflictError extends BaseError {
  constructor(message = "Conflict", extensions?: Record<string, any>) {
    super(message, "CONFLICT", extensions);
  }
}
export class InternalServerError extends BaseError {
  constructor(message = "Something went wrong") {
    super(message, "INTERNAL_SERVER_ERROR");
  }
}

export const ChatErrors = {
  // AUTHENTICATION ERROR
  USER_NOT_LOGGED_IN: new AuthenticationError("User not logged in"),
  INVALID_RESET_TOKEN: new AuthenticationError(
    "Invalid or expired password reset token."
  ),
  TOKEN_EXPIRED: new AuthenticationError("Token has expired."),
  EMAIL_VERIFICATION_TOKEN_EXPIRED: new AuthenticationError(
    "Email verification link has expired."
  ),

  // AUTHORIZATION ERROR
  NOT_A_MEMBER: new AuthorizationError("You are not a member of this room."),
  NOT_AN_ADMIN: new AuthorizationError("Only admins can perform this action."),

  // NOT FOUND ERROR
  ROOM_NOT_FOUND: new NotFoundError("Room does not exist."),
  MESSAGE_NOT_FOUND: new NotFoundError("Message not found."),
  USER_NOT_FOUND: new NotFoundError("User not found"),

  // CONFLICT ERROR
  ALREADY_IN_ROOM: new ConflictError("User is already a member of the room."),
  ALREADY_SENT_REQUEST: new ConflictError(
    "You have already requested to join."
  ),
  EXISTING_USER: new ConflictError("User already exists"),

  // USER INPUT ERROR
  CANNOT_MESSAGE_SELF: new UserInputError(
    "You cannot send a message to yourself."
  ),
  CANNOT_REMOVE_SELF: new UserInputError(
    "You cannot remove yourself from the room."
  ),
  INVALID_EMAIL_PASSWORD: new UserInputError("Invalid email or password"),
  INCORRECT_CURRENT_PASSWORD: new UserInputError("Incorrect current password"),
};
