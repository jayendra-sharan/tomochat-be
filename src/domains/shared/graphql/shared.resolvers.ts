export const sharedResolvers = {
  RoomMember: {
    user: (parent) => parent.user,
    room: (parent) => parent.room,
    joinedAt: (parent) => parent.joinedAt.toISOString()
  },
  Room: {
    members: (parent) => parent.members,
    messageCount: (parent) => parent.messages.length
  },
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  UserConnection: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  }
}
