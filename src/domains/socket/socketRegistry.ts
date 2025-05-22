const userSocketMap = new Map<string, Set<string>>();

export function addUserSocket(userId: string, socketId: string) {
  if (!userSocketMap.has(userId)) userSocketMap.set(userId, new Set());

  userSocketMap.get(userId)!.add(socketId);
}

export function removeUserSocket(userId: string, socketId: string) {
  const sockets = userSocketMap.get(userId);
  if (!sockets) return;

  sockets.delete(socketId);
  if (sockets.size === 0) userSocketMap.delete(userId);
}

export function getUserSockets(userId: string): string[] {
  return Array.from(userSocketMap.get(userId) || []);
}
