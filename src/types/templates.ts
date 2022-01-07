export const serverMessageEvents: Record<ServerMessageEventType, any> = {
  ping: JSON.stringify({ event: "ping" }),
  pong: JSON.stringify({ event: "pong" }),
  message: (message: string, user?: string) =>
    JSON.stringify({ event: "message", user, value: message }),
  error: (error: string) => JSON.stringify({ event: "error", value: error }),
};

const ClientMessageEvents = [
  "join-room",
  "disconnect",
  "add-shape",
  "remove-shape",
  "edit-shape",
] as const;
const ServerMessageEvents = ["ping", "pong", "message", "error"] as const;
export const MessageEvents = [
  ...ServerMessageEvents,
  ...ClientMessageEvents,
] as const;
export type ServerMessageEventType = typeof ServerMessageEvents[number];
export type ClientMessageEventType = typeof MessageEvents[number];
export type MessageEventType = typeof MessageEvents[number];
