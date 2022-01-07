import { BaseParams, Coordinates } from "./types";

export interface Room {
  availableShapes: ShapeType[];
  lockedShapes: ShapeType[];
}

export type ShapeType = Ellipse | Circle | Rect | Line | Text | Freehand | Path;

export type Ellipse = BaseParams & {
  cx: string;
  cy: string;
  rx: string;
  ry: string;
};
export type Circle = BaseParams & {
  cx: string;
  cy: string;
  r: string;
};
export type Rect = BaseParams & {
  x: string;
  y: string;
  width: string;
  height: string;
};

export type Line = BaseParams & {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
};

export type Text = BaseParams & {
  position: Coordinates;
};

export type Freehand = BaseParams & {
  points: string;
};

export type Path = {
  command: string;
  points?: Coordinates[] | string;
};
