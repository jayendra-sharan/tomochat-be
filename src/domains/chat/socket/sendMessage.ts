// import { Server, Socket } from "socket.io";
// import { prisma } from "@/lib/prisma";
// import { groqAi } from "@/services";
// import { SocketEvents } from "@/constants/socketEvents";

// export async function handleSendMessage(io: Server, socket: Socket, data: any) {
//   const { groupId, userId, content } = data;

//   const response = JSON.parse(await groqAi(content));

//   const aiReply = response.aiReply

//   const originalMessage = content;

//   const suggestion = {
//     original: originalMessage,
//     ...response,
//   };

//   const newMessage = await prisma.message.create({
//     data: {
//       content: aiReply,
//       senderId: userId,
//       groupId: groupId,
//       suggestion
//     },
//     include: {
//       sender: true,
//       group: true,
//     },
//   });

//   io.to(groupId).emit(SocketEvents.NEW_MESSAGE, {
//     ...newMessage,
//     createdAt: newMessage.createdAt.toISOString(),
//   });
// }
