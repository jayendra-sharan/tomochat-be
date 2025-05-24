import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export const createJwt = (userId: string) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" });
}
