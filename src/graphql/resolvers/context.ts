import { createYoga } from "graphql-yoga";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

type Context = {
  userId: string | null;
};

export function createContext({ request }: { request:  Request }): Context {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  console.log("HERE", token);
  let userId = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = decoded.userId;
    } catch (err) {
      // invalid token
      console.log("Invalid token")
    }
  }

  return {
    userId,
  };
}
