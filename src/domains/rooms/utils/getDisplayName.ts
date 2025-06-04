import { User } from "@/generated/prisma/client/client";

export function getDisplayName(
  sender: User | null | undefined,
  userId: string
): string {
  if (!sender) return "";
  if (sender.id === userId) return "You";
  if (sender.id === "SYSTEM") return "";
  return sender.displayName;
}
