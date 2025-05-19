import express from "express";
import { createYoga } from "graphql-yoga";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createContext } from "./context";
import { initSocket } from "@/lib/socket";
import { schema } from './schema';
import { logger } from "@/lib/logger";

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { origin: "*" } });

initSocket(io);

const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/graphql',
  cors: { origin: "*", credentials: true},
  maskedErrors: false,
});

app.use(cors());
app.set('trust proxy', true);
app.get('/', (_, res) => {
  res.send('OK');
});
app.use('/graphql', yoga.requestListener);

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, () => {
  logger.info(`Server running at port ${PORT}`);
});
