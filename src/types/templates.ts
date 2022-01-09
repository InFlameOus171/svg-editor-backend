export const serverMessageEvents: ServerMessageEvents = {
  ping: JSON.stringify({ event: "ping" }),
  pong: JSON.stringify({ event: "pong" }),
  message: (message: string, user?: string) =>
    JSON.stringify({ event: "message", user, value: message }),
  error: (error: string) => JSON.stringify({ event: "error", value: error }),
  shapes: (shapes: string) =>
    JSON.stringify({ event: "get-shapes", value: shapes }),
};

export enum GENERAL_EVENTS {
  MESSAGE = "message",
  PING = "ping",
  PONG = "pong",
  GET_SHAPES = "get-shapes",
  DELETE_SHAPES = "delete-shapes",
  UPDATE_SHAPES = "update-shapes",
  JOIN_ROOM = "join-room",
  DISCONNECT = "disconnect",
}

export enum SERVER_ONLY_EVENTS {
  ERROR = "error",
}

export type ServerMessageEvents = {
  ping: string;
  pong: string;
  message: (msg: string, usr?: string) => string;
  error: (err: string) => string;
  shapes: (shapes: string) => string;
};
// const GeneralMessageEvents = [
//   "message",
//   "ping",
//   "pong",
//   "get-shapes",
//   "delete-shapes",
//   "update-shapes",
// ] as const;
// const ClientMessageEvents = [
//   "join-room",
//   "disconnect",
//   ...GeneralMessageEvents,
// ] as const;
// const ServerMessageEvents = ["error", ...GeneralMessageEvents] as const;
// export const MessageEvents = [
//   ...ServerMessageEvents,
//   ...ClientMessageEvents,
//   ...GeneralMessageEvents,
// ] as const;
// export type ServerMessageEventType = typeof ServerMessageEvents[number];
// export type ClientMessageEventType = typeof MessageEvents[number];
// export type GeneralMessageEventType = typeof GeneralMessageEvents[number];
// export type MessageEventType = typeof MessageEvents[number];
