import { User } from "@/generated/prisma/client/client";
import { getDisplayName } from "./getDisplayName";

export function formatLastMessage(
  sender: User | null | undefined,
  content: string | undefined,
  userId: string
): string {
  if (!content) return "No messages yet";
  const displayName = getDisplayName(sender, userId);
  return content ? `${displayName ? `${displayName}: ` : ""}${content}` : "";
}
