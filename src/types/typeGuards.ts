// export const isEvent = (event: unknown): event is MessageEventType => {
//   return typeof event === "string" && MessageEvents.includes(event as any);
// };
// export const isPing = (event: unknown): boolean => {
//   return isEvent(event) && "ping" === event;
// };
// export const isPong = (event: unknown): boolean => {
//   return isEvent(event) && "pong" === event;
// };
// export const isMessage = (event: unknown): boolean => {
//   return isEvent(event) && "message" === event;
// };
// export const isDisconnect = (event: unknown): boolean => {
//   return isEvent(event) && "disconnect" === event;
// };
// export const isUpdateShapes = (event: unknown): boolean => {
//   return isEvent(event) && "update-shapes" === event;
// };
// export const isRemoveShapes = (event: unknown): boolean => {
//   return isEvent(event) && "delete-shapes" === event;
// };
// export const isGetShapes = (event: unknown): boolean => {
//   return isEvent(event) && "get-shapes" === event;
// };
// export const isError = (event: unknown): boolean => {
//   return isEvent(event) && "error" === event;
// };
// export const isJoinRoom = (event: unknown): boolean => {
//   return isEvent(event) && "join-room" === event;
// };
