import { GENERAL_EVENTS } from "./templates";

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
  event?: GENERAL_EVENTS;
  user?: string;
  userId?: string;
  value?: string | string[];
  roomId?: string;
  [key: string]: any;
};
