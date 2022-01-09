import { IncomingMessage } from "http";
import url from "url";
import { RawData, Server, WebSocket as WebSocketws } from "ws";
import {
  ServerMessageEvents,
  serverMessageEvents,
} from "../../types/templates";
import mongo from "mongodb";
import { ParsedData } from "../../types/types";
import { Database } from "../Database/Database";

const { message, ping, pong, error, shapes } = serverMessageEvents;

export const heartBeat = (socket: WebSocket) => {
  console.log(`Heartbeat...`);
  socket.isAlive = true;
};

export class SocketEventHandler {
  #server: Server;
  #socket: WebSocket;
  #database: Database;
  constructor(server: Server, database: Database, socket: WebSocket) {
    this.#server = server;
    this.#database = database;
    this.#socket = socket;
  }
  parseMessage = (data: RawData): ParsedData => {
    return JSON.parse(data.toString());
  };

  handleEvent = (receivedMessage: RawData): void => {
    const parsedMessage = this.parseMessage(receivedMessage);
    const { event, user, value, userId, roomId } = parsedMessage;
    switch (event) {
      case "update-shapes": {
        console.log(roomId);
        if (!roomId || !value) return;
        this.#database.updateRoom(roomId, value).then(() => {
          this.#database.getShapes(roomId).then((shapes: string) => {
            this.sendToAll(shapes);
            console.log("Updated shapes: ", parsedMessage);
          });
        });
        break;
      }
      case "delete-shapes":
        break;
      case "get-shapes": {
        if (!roomId) return;
        try {
          this.#database.getShapes(roomId);
          this.#socket.send(message("shapeslel"));
        } catch (err) {
          console.error(err);
        }
        break;
      }
      case "disconnect":
        break;
      case "join-room": {
        try {
          if (!!roomId) {
            this.#socket.connectedRoom = roomId;
            this.#socket.send(
              message(`Connected to room: ${this.#socket.connectedRoom}`)
            );
            this.#socket.connectedUser = user;
            this.#socket.connectedUserId = userId;
            console.log(
              "User: %s has joined room with the ID: %s !",
              this.#socket.connectedUser,
              this.#socket.connectedRoom
            );
            this.#database.doesRoomExist(roomId).then((roomDoesExist) => {
              if (roomDoesExist) {
                console.log("Room exists. Returning current shapes.");
                this.#database.getShapes(roomId).then((shapesValue) => {
                  this.#socket.send(shapes(shapesValue));
                });
              } else {
                console.log("Room does not exist. Creating room.");
                this.#database.updateRoom(roomId, value ?? "");
              }
            });
          } else {
            throw new Error("empty_room_id");
          }
        } catch (err) {
          this.#socket.send(error(err as string));
          console.error(err);
        }
        break;
      }
      case "message": {
        if (!value) return;
        this.sendToAll(message(value, user));
        break;
      }
      case "pong": {
        heartBeat(this.#socket);
        break;
      }
      case "ping": {
        this.#socket.send(pong);
        break;
      }
      default:
        console.log(parsedMessage);
    }
  };

  sendToUserById = (id: string, message: string) => {
    this.#server.clients.forEach((client: WebSocket) => {
      if (client.connectedUserId === id) {
        client.send(message);
      }
    });
  };

  sendToAll = (message: string) => {
    this.#server.clients.forEach((client: WebSocket) => {
      if (
        client.readyState === WebSocketws.OPEN &&
        client.connectedRoom &&
        this.#socket.connectedRoom === client.connectedRoom
      ) {
        client.send(message);
      }
    });
  };
}
