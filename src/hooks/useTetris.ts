import { useState, useEffect, useCallback, useRef } from 'react';
import { COLS, ROWS, Tetromino, randomTetromino, INITIAL_DROP_TIME, MIN_DROP_TIME, SPEED_INCREMENT } from '../constants';

export type GridCell = {
  type: string | null;
  color: string | null;
  icon: any | null;
};

export const useTetris = () => {
  const [grid, setGrid] = useState<GridCell[][]>(
    Array.from({ length: ROWS }, () => Array(COLS).fill({ type: null, color: null, icon: null }))
  );
  const [activePiece, setActivePiece] = useState<{
    pos: { x: number; y: number };
    tetromino: Tetromino;
    collided: boolean;
  } | null>(null);
  const [nextPiece, setNextPiece] = useState<Tetromino>(randomTetromino());
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const [dropTime, setDropTime] = useState<number | null>(null);

  const gameLoopRef = useRef<number | null>(null);

  const resetGame = useCallback(() => {
    setGrid(Array.from({ length: ROWS }, () => Array(COLS).fill({ type: null, color: null, icon: null })));
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setDropTime(INITIAL_DROP_TIME);
    const firstPiece = randomTetromino();
    setActivePiece({
      pos: { x: Math.floor(COLS / 2) - 1, y: 0 },
      tetromino: firstPiece,
      collided: false,
    });
    setNextPiece(randomTetromino());
  }, []);

  const checkCollision = useCallback(
    (piece: Tetromino, pos: { x: number; y: number }, currentGrid: GridCell[][]) => {
      for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
          if (piece.shape[y][x] !== 0) {
            const newX = pos.x + x;
            const newY = pos.y + y;

            if (
              newX < 0 ||
              newX >= COLS ||
              newY >= ROWS ||
              (newY >= 0 && currentGrid[newY][newX].type !== null)
            ) {
              return true;
            }
          }
        }
      }
      return false;
    },
    []
  );

  const rotate = (matrix: number[][]) => {
    const rotated = matrix[0].map((_, index) => matrix.map((col) => col[index]).reverse());
    return rotated;
  };

  const rotatePiece = useCallback(() => {
    if (!activePiece || gameOver) return;
    
    const rotatedShape = rotate(activePiece.tetromino.shape);
    const clonedPiece = {
      ...activePiece,
      pos: { ...activePiece.pos },
      tetromino: {
        ...activePiece.tetromino,
        shape: rotatedShape
      }
    };

    // Wall kick
    const originalX = clonedPiece.pos.x;
    let offset = 1;
    while (checkCollision(clonedPiece.tetromino, clonedPiece.pos, grid)) {
      clonedPiece.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (Math.abs(offset) > clonedPiece.tetromino.shape[0].length) {
        clonedPiece.pos.x = originalX;
        return;
      }
    }
    setActivePiece(clonedPiece);
  }, [activePiece, grid, gameOver, checkCollision]);

  const movePiece = useCallback(
    (dir: { x: number; y: number }) => {
      if (!activePiece || gameOver) return;
      const newPos = { x: activePiece.pos.x + dir.x, y: activePiece.pos.y + dir.y };
      if (!checkCollision(activePiece.tetromino, newPos, grid)) {
        setActivePiece((prev) => (prev ? { ...prev, pos: newPos } : null));
      } else if (dir.y > 0) {
        // Collision on downward move
        setActivePiece((prev) => (prev ? { ...prev, collided: true } : null));
      }
    },
    [activePiece, grid, gameOver, checkCollision]
  );

  const drop = useCallback(() => {
    if (!activePiece || gameOver) return;
    
    // Increase level every 1000 points
    if (score > level * 1000) {
      setLevel(prev => prev + 1);
      setDropTime(prev => (prev ? Math.max(prev * SPEED_INCREMENT, MIN_DROP_TIME) : null));
    }

    const newPos = { x: activePiece.pos.x, y: activePiece.pos.y + 1 };
    if (!checkCollision(activePiece.tetromino, newPos, grid)) {
      setActivePiece((prev) => (prev ? { ...prev, pos: newPos } : null));
    } else {
      // Piece landed
      if (activePiece.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        return;
      }
      
      // Merge piece into grid
      const newGrid = grid.map(row => [...row]);
      activePiece.tetromino.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const gridY = activePiece.pos.y + y;
            const gridX = activePiece.pos.x + x;
            if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
              newGrid[gridY][gridX] = {
                type: activePiece.tetromino.type,
                color: activePiece.tetromino.color,
                icon: activePiece.tetromino.icon,
              };
            }
          }
        });
      });

      // Clear lines
      let linesCleared = 0;
      const filteredGrid = newGrid.filter((row) => {
        const isFull = row.every((cell) => cell.type !== null);
        if (isFull) linesCleared++;
        return !isFull;
      });

      while (filteredGrid.length < ROWS) {
        filteredGrid.unshift(Array(COLS).fill({ type: null, color: null, icon: null }));
      }

      if (linesCleared > 0) {
        setScore((prev) => prev + [0, 100, 300, 500, 800][linesCleared] * level);
      }

      setGrid(filteredGrid);
      setActivePiece({
        pos: { x: Math.floor(COLS / 2) - 1, y: 0 },
        tetromino: nextPiece,
        collided: false,
      });
      setNextPiece(randomTetromino());
    }
  }, [activePiece, grid, gameOver, nextPiece, score, level, checkCollision]);

  useEffect(() => {
    if (dropTime !== null && !gameOver) {
      const interval = setInterval(drop, dropTime);
      return () => clearInterval(interval);
    }
  }, [drop, dropTime, gameOver]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'ArrowLeft') movePiece({ x: -1, y: 0 });
      if (e.key === 'ArrowRight') movePiece({ x: 1, y: 0 });
      if (e.key === 'ArrowDown') drop();
      if (e.key === 'ArrowUp') rotatePiece();
      if (e.key === ' ') {
        // Hard drop
        if (!activePiece) return;
        let currentY = activePiece.pos.y;
        while (!checkCollision(activePiece.tetromino, { x: activePiece.pos.x, y: currentY + 1 }, grid)) {
          currentY++;
        }
        // We can't easily call drop multiple times synchronously with state updates, 
        // so we manually calculate the landing position and trigger the landing logic.
        // For simplicity, let's just move it to the bottom and let the next drop cycle handle the merge.
        setActivePiece(prev => prev ? { ...prev, pos: { ...prev.pos, y: currentY } } : null);
      }
    },
    [movePiece, drop, rotatePiece, gameOver, activePiece, grid, checkCollision]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    grid,
    activePiece,
    nextPiece,
    score,
    level,
    gameOver,
    resetGame,
    movePiece,
    rotatePiece,
    drop,
  };
};
