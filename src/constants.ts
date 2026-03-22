import { Apple, Cherry, Grape, Citrus, Banana, Circle, Hexagon } from 'lucide-react';

export const COLS = 10;
export const ROWS = 20;
export const INITIAL_DROP_TIME = 800;
export const MIN_DROP_TIME = 100;
export const SPEED_INCREMENT = 0.9;

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface Tetromino {
  shape: number[][];
  color: string;
  type: TetrominoType;
  icon: any;
}

export const TETROMINOES: Record<TetrominoType, Tetromino> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: 'bg-emerald-500',
    type: 'I',
    icon: Apple,
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-blue-500',
    type: 'J',
    icon: Grape,
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-orange-500',
    type: 'L',
    icon: Citrus,
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'bg-yellow-400',
    type: 'O',
    icon: Banana,
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: 'bg-green-500',
    type: 'S',
    icon: Circle,
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-purple-500',
    type: 'T',
    icon: Hexagon,
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-red-500',
    type: 'Z',
    icon: Cherry,
  },
};

export const randomTetromino = (): Tetromino => {
  const keys = Object.keys(TETROMINOES) as TetrominoType[];
  const randKey = keys[Math.floor(Math.random() * keys.length)];
  return TETROMINOES[randKey];
};
