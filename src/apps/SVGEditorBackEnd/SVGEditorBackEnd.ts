import { IncomingMessage } from "http";
import { WebSocketServer } from "ws";
import { serverMessageEvents } from "../../types/templates.js";
import { MongoDBController } from "../MongoDBController/MongoDBController.js";
import { DBConfig } from "./SVGEditorBackEnd.types";
import { SocketEventHandler, startUpLogo } from "./SVGEditorBackEnd.util.js";

export class SVGEditorBackEnd {
  constructor(dbConfig: DBConfig, port: number) {
    const { userNameDB, passWordDB, initialNameDB, portDB, addressDB } =
      dbConfig;
    const server = new WebSocketServer({ port });
    const connectionUrlDB = `mongodb://${addressDB}:${portDB}/${initialNameDB}`;

    const interval = setInterval(() => {
      server.clients.forEach((webSocket: WebSocket) => {
        if (webSocket.isAlive === false) {
          return webSocket.close();
        }

        webSocket.isAlive = false;
        webSocket.send(serverMessageEvents.ping);
      });
    }, 30000);

    const initOnClose = (socket: WebSocket, handler: SocketEventHandler) => {
      socket.on("close", async () => {
        const unformattedShapes = await database.unlockAllById(
          socket.connectedRoom,
          socket.connectedUserId
        );

        const newShapesInRoom = JSON.stringify(unformattedShapes);
        console.log(
          "new shapes in room ",
          serverMessageEvents.shapes(newShapesInRoom)
        );
        handler.sendToAll(serverMessageEvents.shapes(newShapesInRoom));
      });
      socket.on("close", () => {
        console.log("User", socket.connectedUser, "has disconnected.");
      });
    };

    server.on("connection", (socket: WebSocket, request: IncomingMessage) => {
      socket.isAlive = true;
      socket.isAlive = true;

      const handler = initMessageEventHandler(socket);
      initOnClose(socket, handler);
    });

    server.on("error", () => {
      console.log("User disconnected.");
    });

    server.on("close", () => {
      clearInterval(interval);
      console.log("Connection lost.");
    });

    console.log("Server has been set up!");
    startUpLogo.forEach((value) => console.log(value));
    console.log("Listening on port: ", port);
    console.log("Waiting for database...");
    const database = new MongoDBController(
      connectionUrlDB,
      userNameDB,
      passWordDB
    );
    database.initDB();
    const initMessageEventHandler = (socket: WebSocket) => {
      const socketEventHandler = new SocketEventHandler(
        server,
        database,
        socket
      );
      socket.on("message", (receivedMessage) => {
        socketEventHandler.handleEvent(receivedMessage);
      });
      return socketEventHandler;
    };
  }
}
