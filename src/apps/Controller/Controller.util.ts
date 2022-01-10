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

  #handleUpdateShapes = async (
    value: string | string[] | undefined,
    roomId: string | undefined,
    lockedById?: string
  ) => {
    const incomingChangedShapes = value as string[];
    if (!roomId || !value || !value.length) return;

    const unformattedShapes = await this.#database.updateRoom(
      roomId,
      incomingChangedShapes,
      lockedById
    );
    const newShapesInRoom = JSON.stringify(unformattedShapes);
    console.log("new shapes in room ", shapes(newShapesInRoom));
    this.sendToAll(shapes(newShapesInRoom));
  };

  #handleDeleteShapes = async (
    roomId: string | undefined,
    ids?: string | string[]
  ) => {
    const newShapes = await this.#database.deleteShapes(roomId, ids);
    const newShapesInRoom = JSON.stringify(newShapes);
    this.sendToAll(shapes(newShapesInRoom));
  };

  handleEvent = async (receivedMessage: RawData) => {
    const parsedMessage = this.parseMessage(receivedMessage);
    const { event, user, value, userId, roomId } = parsedMessage;
    switch (event) {
      case "update-shapes": {
        this.#handleUpdateShapes(value, roomId);
        break;
      }
      case "delete-shapes": {
        console.log("DELETING", roomId, value);
        this.#handleDeleteShapes(roomId, value);
        break;
      }
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
        const incomingChangedShapes = value as string[];

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
            if (await this.#database.doesRoomExist(roomId)) {
              console.log("Room exists. Returning current shapes.");
              const aaa = await this.#database.getShapes(roomId);
              this.#database.getShapes(roomId).then((shapesValue) => {
                this.#socket.send(shapes(JSON.stringify(shapesValue)));
              });
            } else {
              console.log("Room does not exist. Creating room.");
              this.#database.createRoom(roomId, incomingChangedShapes ?? []);
            }
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
        this.sendToAll(message(value as string, user));
        break;
      }
      case "lock-shapes": {
        console.log("LOCKING", value);
        if (value === undefined || !roomId) return;
        this.#handleUpdateShapes(value, roomId, userId);
      }
      case "unlock-shapes": {
        console.log("UNLOCKING", value);
        if (value === undefined || !roomId) return;
        this.#handleUpdateShapes(value, roomId);
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
        console.log(client.connectedRoom, client.connectedUser);

        client.send(message);
      }
    });
  };
}
