require("../services/instrument");

import express from "express";
import { createYoga } from "graphql-yoga";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { createContext } from "./context";
import { initSocket } from "@/lib/socket";
import { schema } from "./schema";
import { logger } from "@/lib/logger";
import { createTomo } from "@/domains/admin/routes/createTomo";

const Sentry = require("@sentry/node");

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { origin: "*" } });

initSocket(io);

const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: "/graphql",
  cors: { origin: "*", credentials: true },
  maskedErrors: false,
});
app.get("/", (_, res) => {
  res.send("OK");
});
app.get("/user/create-tomo", createTomo);
app.use("/graphql", yoga.requestListener);
app.get("/run-migrations", async (req, res) => {
  // const auth = req.headers.authorization;
  // const token = auth?.split(' ')[1];

  // basic secret check (replace with real token validation)
  // if (token !== process.env.ADMIN_MIGRATION_TOKEN) {
  //   return res.status(403).send('Forbidden');
  // }

  const { exec } = await import("child_process");
  exec("npx prisma migrate deploy", (err, stdout, stderr) => {
    if (err) return res.status(500).send(`Error: ${stderr}`);
    return res.send(`Success: ${stdout}`);
  });
});

if (process.env.NODE_ENV === "production") {
  logger.info("Initializing Sentry");
  Sentry.setupExpressErrorHandler(app);
}

app.use(cors());
app.set("trust proxy", true);

const PORT = Number(process.env.PORT) || 3001;
httpServer.listen(PORT, () => {
  logger.info(`Server running at port ${PORT}`);
});
