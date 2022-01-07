import dotenv from "dotenv";
import { IncomingMessage } from "http";
import mongo, { Auth } from "mongodb";
import { WebSocketServer } from "ws";
import { serverMessageEvents } from "../../types/templates";
import { SocketEventHandler } from "./Controller.util";

dotenv.config();

{
  const port = parseInt(process.env.PORT ?? "8080");
  const server = new WebSocketServer({ port });
  const { DB_USERNAME, DB_PASSWORD, DB_INITDB, DB_PORT } = process.env;

  const interval = setInterval(() => {
    server.clients.forEach((webSocket: WebSocket) => {
      if (webSocket.isAlive === false) {
        return webSocket.close();
      }

      webSocket.isAlive = false;
      webSocket.send(serverMessageEvents.ping);
    });
  }, 30000);

  const notifyServerStarted = () => {
    console.log("Server has been set up!");
    console.log("Waiting for database...");
  };

  const notifyFinish = () => {
    console.log("Listening on port: ", port);
  };

  const initOnClose = (socket: WebSocket) => {
    socket.on("close", () => {
      console.log("User", socket.connectedUser, "has disconnected.");
    });
  };

  const initMessageEventHandler = (
    socket: WebSocket,
    request: IncomingMessage
  ) => {
    const socketEventHandler = new SocketEventHandler(server, socket, request);
    socket.on("message", (receivedMessage) => {
      socketEventHandler.handleEvent(receivedMessage);
    });
  };

  server.on("connection", (socket: WebSocket, request: IncomingMessage) => {
    socket.isAlive = true;
    socket.isAlive = true;

    initOnClose(socket);
    initMessageEventHandler(socket, request);
  });

  server.on("error", () => {
    console.log("user left");
  });

  server.on("close", () => {
    clearInterval(interval);
    console.log("connection lost");
  });

  const MongoClient = mongo.MongoClient;
  const mongoUrl = `mongodb://db:${DB_PORT}/${DB_INITDB}`;
  const auth: Auth = { username: DB_USERNAME, password: DB_PASSWORD };

  MongoClient.connect(mongoUrl, { auth }, (error, db) => {
    if (error) throw error;
    console.log("Connected with database!");
    if (db) {
      const dbo = db?.db("svgeditor");
      if (!dbo.collection("rooms")) {
        dbo.createCollection("rooms", (err, res) => {
          if (err) throw err;
          console.log("Collection created!");
          db.close();
        });
      } else {
        console.log(
          'Did not create collection "rooms", because it already exists!'
        );
      }
    }
    notifyFinish();
  });

  notifyServerStarted();
}
