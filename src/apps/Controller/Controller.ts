import dotenv from "dotenv";
import { IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import { serverMessageEvents } from "../../types/templates";
import { Database } from "../Database/Database";
import { SocketEventHandler } from "./Controller.util";

dotenv.config();

{
  const { DB_USERNAME, DB_PASSWORD, DB_INITDB, DB_PORT, DB_ADDRESS } =
    process.env;

  const port = parseInt(process.env.BACKEND_PORT ?? "8080");
  const server = new WebSocketServer({ port });
  const DB_URL = `mongodb://${DB_ADDRESS}:${DB_PORT}/${DB_INITDB}`;

  const interval = setInterval(() => {
    server.clients.forEach((webSocket: WebSocket) => {
      if (webSocket.isAlive === false) {
        return webSocket.close();
      }

      webSocket.isAlive = false;
      webSocket.send(serverMessageEvents.ping);
    });
  }, 30000);

  const initOnClose = (socket: WebSocket) => {
    socket.on("close", () => {
      console.log("User", socket.connectedUser, "has disconnected.");
    });
  };

  server.on("connection", (socket: WebSocket, request: IncomingMessage) => {
    socket.isAlive = true;
    socket.isAlive = true;

    initOnClose(socket);
    initMessageEventHandler(socket);
  });

  server.on("error", () => {
    console.log("User disconnected.");
  });

  server.on("close", () => {
    clearInterval(interval);
    console.log("Connection lost.");
  });

  console.log("Server has been set up!");
  console.log("Listening on port: ", port);
  console.log("Waiting for database...");
  const database = new Database(DB_URL, DB_USERNAME, DB_PASSWORD);
  database.initDB();
  const initMessageEventHandler = (socket: WebSocket) => {
    const socketEventHandler = new SocketEventHandler(server, database, socket);
    socket.on("message", (receivedMessage) => {
      socketEventHandler.handleEvent(receivedMessage);
    });
  };
}
