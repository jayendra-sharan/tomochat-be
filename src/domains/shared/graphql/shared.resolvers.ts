export const sharedResolvers = {
  RoomMember: {
    user: (parent) => parent.user,
    room: (parent) => parent.room,
    joinedAt: (parent) => parent.joinedAt.toISOString()
  },
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
  UserConnection: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  }
}
