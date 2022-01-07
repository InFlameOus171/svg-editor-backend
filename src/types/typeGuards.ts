import { MessageEventType, MessageEvents } from "./templates";

export const isEvent = (event: unknown): event is MessageEventType => {
  return typeof event === "string" && MessageEvents.includes(event as any);
};
export const isPing = (event: unknown): boolean => {
  return isEvent(event) && "ping" === event;
};
export const isPong = (event: unknown): boolean => {
  return isEvent(event) && "pong" === event;
};
export const isMessage = (event: unknown): boolean => {
  return isEvent(event) && "message" === event;
};
export const isDisconnect = (event: unknown): boolean => {
  return isEvent(event) && "disconnect" === event;
};
export const isAddShape = (event: unknown): boolean => {
  return isEvent(event) && "add-shape" === event;
};
export const isRemoveShape = (event: unknown): boolean => {
  return isEvent(event) && "remove-shape" === event;
};
export const isEditShape = (event: unknown): boolean => {
  return isEvent(event) && "edit-shape" === event;
};
export const isError = (event: unknown): boolean => {
  return isEvent(event) && "error" === event;
};
export const isJoinRoom = (event: unknown): boolean => {
  return isEvent(event) && "join-room" === event;
};
