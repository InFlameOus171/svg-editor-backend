import { WebSocket as WebSocketBase } from "ws";
declare global {
  type WebSocket = Omit<WebSocketBase, "send"> & {
    isAlive?: boolean;
    // ping: () => void;
    // pong: () => void;
    // send: (message: string) => void;
    connectedRoom?: string;
    connectedUser?: string;
    connectedUserId?: string;
    send(data: TemplateType, cb?: (err?: Error) => void): void;
    send(
      data: TemplateType,
      options: {
        mask?: boolean | undefined;
        binary?: boolean | undefined;
        compress?: boolean | undefined;
        fin?: boolean | undefined;
      },
      cb?: (err?: Error) => void
    ): void;
  };
}
// 🐒
Object.assign(WebSocketBase.prototype, { isAlive: undefined });

export default WebSocket;
