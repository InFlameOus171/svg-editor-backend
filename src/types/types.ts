import { ClientMessageEventType } from "./templates";

export type Coordinates = [number, number];
export type BaseParams = {
  id: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  lineDash?: number[];
  lineCap?: string;
  fontFamily?: string;
  fontSize?: number;
  transformMatrix?: Matrix;
  text?: string;
};

export type Matrix = [number, number, number, number, number, number];

export type ParsedData = {
  event?: ClientMessageEventType;
  user?: string;
  value?: string;
  [key: string]: any;
};
