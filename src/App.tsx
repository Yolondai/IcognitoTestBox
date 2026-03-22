import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, RotateCcw, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Zap } from 'lucide-react';
import { useTetris, GridCell } from './hooks/useTetris';
import { COLS, ROWS } from './constants';

interface CellProps {
  cell: GridCell;
  isActive?: boolean;
  isGhost?: boolean;
  key?: string;
}

const Cell = ({ cell, isActive = false, isGhost = false }: CellProps) => {
  const Icon = cell.icon;
  
  // Robust check for a renderable component
  const isValidComponent = Icon && (
    typeof Icon === 'function' || 
    (typeof Icon === 'object' && Icon !== null)
  );

  return (
    <div
      className={`relative w-full aspect-square border border-white/5 flex items-center justify-center rounded-sm transition-all duration-100 ${
        cell.color || 'bg-black/20'
      } ${isActive ? 'shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10' : ''} ${isGhost ? 'opacity-20' : ''}`}
    >
      {isValidComponent && (
        <Icon 
          className={`w-4/5 h-4/5 text-white/90 drop-shadow-md ${isActive ? 'animate-pulse' : ''}`} 
          strokeWidth={2.5}
        />
      )}
    </div>
  );
};

export default function App() {
  const { grid, activePiece, nextPiece, score, level, gameOver, resetGame } = useTetris();

  // Create a display grid that includes the active piece and ghost piece
  const displayGrid = grid.map(row => [...row]);
  
  if (activePiece) {
    // Calculate ghost position
    let ghostY = activePiece.pos.y;
    while (!grid.some((row, y) => 
      activePiece.tetromino.shape.some((shapeRow, sy) => 
        shapeRow.some((value, sx) => {
          if (value === 0) return false;
          const nextY = ghostY + sy + 1;
          const nextX = activePiece.pos.x + sx;
          return nextY >= ROWS || (nextY >= 0 && grid[nextY][nextX].type !== null);
        })
      )
    )) {
      ghostY++;
    }

    // Draw ghost piece
    activePiece.tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const gridY = ghostY + y;
          const gridX = activePiece.pos.x + x;
          if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            displayGrid[gridY][gridX] = {
              type: activePiece.tetromino.type,
              color: activePiece.tetromino.color,
              icon: activePiece.tetromino.icon,
              isGhost: true, // Mark as ghost
            } as any;
          }
        }
      });
    });

    // Draw active piece
    activePiece.tetromino.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const gridY = activePiece.pos.y + y;
          const gridX = activePiece.pos.x + x;
          if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            displayGrid[gridY][gridX] = {
              type: activePiece.tetromino.type,
              color: activePiece.tetromino.color,
              icon: activePiece.tetromino.icon,
            };
          }
        }
      });
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500/30 flex items-center justify-center p-4 overflow-hidden">
      {/* Background Decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start max-w-4xl w-full">
        {/* Left Panel: Stats */}
        <div className="flex flex-col gap-4 w-full md:w-48 order-2 md:order-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <Trophy size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Score</span>
            </div>
            <div className="text-3xl font-mono font-bold">{score.toLocaleString()}</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Zap size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Level</span>
            </div>
            <div className="text-3xl font-mono font-bold">{level}</div>
          </motion.div>

          <div className="hidden md:flex flex-col gap-2 mt-4">
            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2">Controls</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 p-2 rounded-lg">
                <ArrowLeft size={12} /> Move
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 p-2 rounded-lg">
                <ArrowUp size={12} /> Rotate
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 p-2 rounded-lg">
                <ArrowDown size={12} /> Drop
              </div>
              <div className="flex items-center gap-2 text-xs text-white/60 bg-white/5 p-2 rounded-lg">
                <span className="text-[10px] border border-white/20 px-1 rounded">SPACE</span> Hard
              </div>
            </div>
          </div>
        </div>

        {/* Center: Game Board */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative group order-1 md:order-2"
        >
          <div className="bg-white/5 backdrop-blur-xl border-4 border-white/10 rounded-xl overflow-hidden shadow-2xl">
            <div 
              className="grid gap-px bg-white/5"
              style={{ 
                gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
                width: 'min(80vw, 320px)',
                aspectRatio: `${COLS}/${ROWS}`
              }}
            >
              {displayGrid.map((row, y) => 
                row.map((cell, x) => (
                  <Cell 
                    key={`${x}-${y}`} 
                    cell={cell} 
                    isActive={activePiece?.pos.y === y && activePiece?.pos.x === x} 
                    isGhost={(cell as any).isGhost}
                  />
                ))
              )}
            </div>
          </div>

          {/* Overlays */}
          <AnimatePresence>
            {!activePiece && !gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center rounded-xl z-20"
              >
                <button 
                  onClick={resetGame}
                  className="group flex flex-col items-center gap-4 hover:scale-105 transition-transform"
                >
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] group-hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] transition-all">
                    <Play size={40} className="text-white fill-current ml-1" />
                  </div>
                  <span className="text-lg font-bold tracking-widest uppercase">Start Game</span>
                </button>
              </motion.div>
            )}

            {gameOver && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-red-500/20 backdrop-blur-md flex items-center justify-center rounded-xl z-30 border-4 border-red-500/50"
              >
                <div className="text-center p-8 bg-black/80 rounded-3xl border border-white/10 shadow-2xl">
                  <h2 className="text-4xl font-black text-red-500 mb-2 uppercase italic tracking-tighter">Game Over</h2>
                  <p className="text-white/60 mb-6 font-mono">Final Score: {score}</p>
                  <button 
                    onClick={resetGame}
                    className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-emerald-400 transition-colors mx-auto"
                  >
                    <RotateCcw size={18} /> Try Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right Panel: Next Piece */}
        <div className="flex flex-col gap-4 w-full md:w-48 order-3">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl"
          >
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">Next Fruit</div>
            <div className="bg-black/40 rounded-xl p-4 aspect-square flex items-center justify-center">
              <div 
                className="grid gap-px"
                style={{ 
                  gridTemplateColumns: `repeat(${nextPiece.shape[0].length}, 1fr)`,
                }}
              >
                {nextPiece.shape.map((row, y) => 
                  row.map((value, x) => (
                    <div key={`${x}-${y}`} className="w-6 h-6">
                      {value !== 0 && (
                        <Cell cell={{ type: nextPiece.type, color: nextPiece.color, icon: nextPiece.icon }} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>

          <div className="mt-auto hidden md:block">
            <div className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] text-center">
              Fruit Tetris v1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
