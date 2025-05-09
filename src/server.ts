import express from "express";
import { createYoga } from "graphql-yoga";
import { Server } from 'socket.io';
import { schema } from "./graphql/schemas";
import cors from "cors";
import { createContext } from "./graphql/resolvers/context";
import { prisma } from "./db/prisma";
import { createServer } from "http";


const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });

export { io };

const yoga = createYoga({
  schema,
  context: createContext,
  maskedErrors: false,
  graphqlEndpoint: '/graphql',
  cors: {
    origin: '*',
    credentials: true
  }
});

app.set('trust proxy', true);
app.use(cors());
app.get("/", (_, res) => {
  res.send("OK");
});
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

const PORT = Number(process.env.PORT) || 3001;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log('Server running at port: ', PORT);
});
