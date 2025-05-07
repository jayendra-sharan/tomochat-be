import express from "express";
import { createYoga } from "graphql-yoga";
import { Server } from 'socket.io';
import http from "http";
import { schema } from "./graphql/schemas";
import cors from "cors";
import { createContext } from "./graphql/resolvers/context";
import { prisma } from "./db/prisma";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

export { io };

const yoga = createYoga({
  schema,
  context: createContext,
});

app.use(cors());
app.use('/graphql', yoga.requestListener);
io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("chatMessage", (data) => {
    console.log("Message received", data);
    // Save to DB or broadcast
    io.to(data.roomId).emit("message", data);
  });

  socket.on("joinRoom", (groupId) => {
    socket.join(groupId);
    console.log("User joined room", groupId);
  });

  socket.on("sendMessage", async (data) => {
    const { groupId, userId, content } = data;

    // save to db
    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        groupId,
      },
      include: {
        sender: true,
        group: true,
      },
    });

    io.to(groupId).emit('newMessage', {
      ...message,
      createdAt: message.createdAt.toISOString(),
    });
  })



});

server.listen(3001, '0.0.0.0', () => {
  console.log('Server ready at http://localhost:3001');
});
