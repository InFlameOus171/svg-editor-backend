import { IncomingMessage } from "http";
import url from "url";
import { RawData, Server, WebSocket as WebSocketws } from "ws";
import { serverMessageEvents } from "../../types/templates";
import { ParsedData } from "../../types/types";

const { message, ping, pong, error } = serverMessageEvents;

export const heartBeat = (socket: WebSocket) => {
  console.log(``);
  socket.isAlive = true;
};

export class SocketEventHandler {
  #server: Server;
  #socket: WebSocket;
  #url?: string;
  constructor(server: Server, socket: WebSocket, request: IncomingMessage) {
    this.#server = server;
    this.#socket = socket;
    this.#url = request.url;
  }
  parseMessage = (data: RawData): ParsedData => {
    return JSON.parse(data.toString());
  };

  handleEvent = (receivedMessage: RawData): void => {
    const parsedMessage = this.parseMessage(receivedMessage);
    const { event, user, value } = parsedMessage;
    switch (event) {
      case "add-shape":
        break;
      case "remove-shape":
        break;
      case "edit-shape": {
        try {
        } catch (err) {
          console.error(err);
        }
        break;
      }
      case "disconnect":
        break;
      case "join-room": {
        try {
          if (this.#url) {
            const room = url.parse(this.#url, true).query.room;
            if (typeof room === "string") {
              this.#socket.connectedRoom = room;
              this.#socket.send(
                message(`Connected to room: ${this.#socket.connectedRoom}`)
              );
            }
            this.#socket.connectedUser = user;
            console.log(
              "User: %s has joined room with the ID: %s !",
              this.#socket.connectedUser,
              this.#socket.connectedRoom
            );
          } else {
            throw new Error("empty_room_id");
          }
        } catch (err) {
          this.#socket.send(error(err));
          console.error(err);
        }
        break;
      }
      case "message": {
        this.#server.clients.forEach((client: WebSocket) => {
          if (
            client.readyState === WebSocketws.OPEN &&
            client.connectedRoom &&
            this.#socket.connectedRoom === client.connectedRoom
          ) {
            client.send(message(value, user));
          }
        });
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
}
