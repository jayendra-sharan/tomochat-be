import { firebaseAdminAuth } from "./firebaseAdmin";

export const verifyIdToken = async (token: string) => {
  return firebaseAdminAuth.verifyIdToken(token);
};
