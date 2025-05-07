import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from '../../db/prisma';
import { io } from '../../server';
import axios from "axios";
import { groqAi } from "../../services";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // put this in env

export const resolvers = {
  Query: {
    me: async (_: any, _args: any, context: any) => {
      const { userId } = context;

      if (!userId) {
        return "User not authenticated"
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          groups: {
            include: {
              group: {
                include: {
                  members: {
                    include: {
                      user: true,
                    }
                  }
                }
              }
            }
          }
        }
      });
      if (!user) {
        return "User not found";
      }

      const groups = user.groups.map((gm) => gm.group);

      return {
        ...user,
        groups,
      };
    },
    login: async (_: any, { input }: any) => {
      const { email, password } = input;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return { error: "Invalid email address or password" };
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return { error: "Invalid email address or password" };
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "1d"
      })

      return {
        token,
        user,
      }
    },
    users: async () => {
      return prisma.user.findMany({
        include: {
          groups: {
            include: {
              group: true,
            },
          },
        },
      });
    },

    groups: async () => {
      return prisma.group.findMany({
        include: {
          members: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              sender: true,
            },
          },
        },
      });
    },

    messages: async (_parent, { groupId }: any, context: any) => {
      const userId = context.userId;
      if (!userId) {
        return "Not authenticated";
      }
      
      const membership = await prisma.groupMember.findFirst({
        where: { userId, groupId }
      });

      if (!membership) {
        return "You are not a member of this group."
      }

      const messages = await prisma.message.findMany({
        where: {
          groupId: groupId,
        },
        include: {
          sender: true,
          group: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      return messages;
    },

    myGroups: async (_: any, args: any, context: any) => {
      const userId = context.userId;
      if (!userId) {
        return "not authenticated";
      }
  
      const memberships = await prisma.groupMember.findMany({
        where: { userId },
        include: {
          group: {
            include: {
              members: {
                include: {
                  user: true
                }
              }
            }
          }
        }
      });
  
      return memberships.map((membership) => membership.group)
    },
  },

  Mutation: {
    createUser: async (_: any, { input }: any) => {
      const { email, displayName, password } = input;

      // check for existing user
      const existing = await prisma.user.findUnique({
        where: { email }
      });

      if (existing) {
        throw new Error('User already exist');
      }

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // create user
        const user = await prisma.user.create({
        data: {
          email,
          displayName,
          password: hashedPassword,
        },
      });

      return user;
    },

    createGroup: async (_: any, { input }: any, context: any) => {
      const userId = context.userId;
      console.log("User ID", userId);
      if (!userId) {
        return "User not authenticated"
      }

      const { name, groupType, topic } = input;
      const inviteLink = crypto.randomBytes(4).toString("hex");

      const group = await prisma.group.create({
        data: {
          name,
          groupType,
          topic,
          inviteLink,
          members: {
            create: [
              {
                userId,
                role: "admin"
              }
            ],
          },
        },
        include: {
          members: true,
        }
      });

      const autoMessage = await prisma.message.create({
        data: {
          content: `${group.name} created successfully.`,
          senderId: userId,
          groupId: group.id,
        }
      });

      io.to(group.id).emit('newMessage', autoMessage);

      return {
        ...group,
        inviteLink: `${group.inviteLink}--${group.id}`
      };
    },

    joinGroupByInviteLink: async (_: any, { input }: any, context: any) => {
      const userId = context.userId;
      const { inviteLink } = input;
      const [inviteId, groupId] = inviteLink.split("--");

      console.log('User id', userId);

      if(!userId) {
        return "User not authenticated!"
      }

      const group = await prisma.group.findUnique({
        where: { id: groupId }
      });

      const exisitingMember = await prisma.groupMember.findFirst({
        where: {
          groupId,
          userId: userId
        },
      });

      if (exisitingMember) {
        // console.log("Already a member");
        // io.to(groupId).emit('newMessage', {
        //   id: Math.random(),
        //   createdAt: Date.now(),
        //   content: "User is already a member",
        //   sender: {
        //     senderId: userId,
        //     displayName: "System",
        //   }
        // });

        return group;
      }

      await prisma.groupMember.create({
        data: {
          groupId: groupId,
          userId,
          role: "member",
        },
      });

      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        }
      })

      const autoMessage = await prisma.message.create({
        data: {
          content: `${user?.displayName || user?.email} joined the group`,
          senderId: userId,
          groupId: groupId,
        },

        include: {
          sender: true,
          group: true,
        },
      });

      io.to(groupId).emit('newMessage', autoMessage);

      return group;
    },

    joinGroup: async (_parent, args) => {
      await prisma.groupMember.create({
        data: {
          userId: args.userId,
          groupId: args.groupId,
        },
      });

      const user = await prisma.user.findUnique({
        where: { id: args.userId },
      });

      const autoMessage = await prisma.message.create({
        data: {
          content: `${user.displayName} joined the group`,
          senderId: args.userId,
          groupId: args.groupId,
        },
        include: {
          sender: true,
          group: true,
        },
      });

      io.to(args.groupId).emit('newMessage', autoMessage);

      return prisma.group.findUnique({
        where: { id: args.groupId },
        include: {
          members: {
            include: {
              user: true,
            },
          },
          messages: {
            include: {
              sender: true,
            },
          },
        },
      });
    },

    sendMessage: async (_parent: any , { input }: any, context: any) => {
      const { groupId, content } = input;
      const { userId } = context;

      const response = await groqAi(content);
      // const res = await fetch("http://localhost:3002/ai/respond", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     message: content,
      //     context: [],
      //     userId
      //   })
      // });

      // const response = await res.json();

      
      const responseJson = JSON.parse(response);
      
      console.log("here...........")
      console.log("response", responseJson);
      console.log("here...........")
      const aiReply = responseJson.aiReply

      const originalMessage = content;

      const suggestion = {
        original: originalMessage,
        ...responseJson,
      };

      const newMessage = await prisma.message.create({
        data: {
          content: aiReply,
          senderId: userId,
          groupId: groupId,
          suggestion
        },
        include: {
          sender: true,
          group: true,
        },
      });

      io.to(groupId).emit('newMessage', {
        ...newMessage,
        createdAt: newMessage.createdAt.toISOString(), // Ensure date is stringified
      });

      return newMessage;
    },
    clearGroupMessages: async (_parent: any, { input }: any, context: any ) => {
      const { groupId } = input;
      const userId = context.userId;
    
      if (!userId) {
        throw new Error("Not authenticated");
      }
    
      // Optional → check if user is admin of the group
      const membership = await prisma.groupMember.findFirst({
        where: {
          userId,
          groupId,
        },
      });
    
      if (!membership) {
        throw new Error("You are not a member of this group");
      }
    
      // Delete messages
      await prisma.message.deleteMany({
        where: {
          groupId,
        },
      });
    
      return true;
    }
  },

  GroupMember: {
    user: (parent) => parent.user,
    group: (parent) => parent.group,
    joinedAt: (parent) => parent.joinedAt.toISOString(),
  },

  Message: {
    createdAt: (parent) => parent.createdAt.toISOString(),
  },
};