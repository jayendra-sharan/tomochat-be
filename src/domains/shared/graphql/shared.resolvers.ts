export const sharedResolvers = {
  GroupMember: {
    user: (parent) => parent.user,
    group: (parent) => parent.group,
    joinedAt: (parent) => parent.joinedAt.toISOString()
  },
  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  }
}
