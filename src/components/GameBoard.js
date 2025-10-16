// 棋盘组件
import React, { useState } from 'react';
import { BOARD_SIZE, CELL_SIZE, PLAYER } from '../constants/gameConstants';
import './GameBoard.css';

const GameBoard = ({
  boardState,
  currentPlayer,
  lastMove,
  winLine,
  onCellClick,
  selectingSkillTarget,
  disabled,
}) => {
  const [hoverCell, setHoverCell] = useState(null);

  const handleCellClick = (x, y) => {
    if (disabled) return;
    onCellClick(x, y);
  };

  const handleCellHover = (x, y) => {
    if (disabled) return;
    setHoverCell({ x, y });
  };

  const handleCellLeave = () => {
    setHoverCell(null);
  };

  const isWinningCell = (x, y) => {
    if (!winLine) return false;
    return winLine.some(([wx, wy]) => wx === x && wy === y);
  };

  const isLastMoveCell = (x, y) => {
    if (!lastMove) return false;
    return lastMove.x === x && lastMove.y === y;
  };

  const renderPiece = (x, y) => {
    const piece = boardState[x][y];
    if (piece === PLAYER.NONE) return null;

    const isWinning = isWinningCell(x, y);
    const isLast = isLastMoveCell(x, y);

    return (
      <div
        className={`piece ${piece === PLAYER.BLACK ? 'black' : 'white'} ${
          isWinning ? 'winning' : ''
        } ${isLast ? 'last-move' : ''}`}
      />
    );
  };

  const renderHoverPiece = (x, y) => {
    if (!hoverCell || hoverCell.x !== x || hoverCell.y !== y) return null;
    if (boardState[x][y] !== PLAYER.NONE) return null;

    const pieceClass = selectingSkillTarget
      ? 'remove-indicator'
      : currentPlayer === PLAYER.BLACK
      ? 'black'
      : 'white';

    return <div className={`piece ${pieceClass} hover-piece`} />;
  };

  const boardWidth = BOARD_SIZE * CELL_SIZE;
  const boardHeight = BOARD_SIZE * CELL_SIZE;

  return (
    <div className="game-board-container">
      <svg
        className="board-grid"
        width={boardWidth}
        height={boardHeight}
        style={{ border: '2px solid #8B4513' }}
      >
        {/* 绘制网格线 */}
        {Array.from({ length: BOARD_SIZE }).map((_, i) => (
          <React.Fragment key={`grid-${i}`}>
            <line
              x1={CELL_SIZE / 2}
              y1={i * CELL_SIZE + CELL_SIZE / 2}
              x2={boardWidth - CELL_SIZE / 2}
              y2={i * CELL_SIZE + CELL_SIZE / 2}
              stroke="#000"
              strokeWidth="1"
            />
            <line
              x1={i * CELL_SIZE + CELL_SIZE / 2}
              y1={CELL_SIZE / 2}
              x2={i * CELL_SIZE + CELL_SIZE / 2}
              y2={boardHeight - CELL_SIZE / 2}
              stroke="#000"
              strokeWidth="1"
            />
          </React.Fragment>
        ))}

        {/* 天元标记点 */}
        {[[3, 3], [3, 11], [7, 7], [11, 3], [11, 11]].map(([x, y]) => (
          <circle
            key={`star-${x}-${y}`}
            cx={x * CELL_SIZE + CELL_SIZE / 2}
            cy={y * CELL_SIZE + CELL_SIZE / 2}
            r="3"
            fill="#000"
          />
        ))}

        {/* 获胜连线 */}
        {winLine && winLine.length >= 2 && (
          <line
            className="win-line"
            x1={winLine[0][0] * CELL_SIZE + CELL_SIZE / 2}
            y1={winLine[0][1] * CELL_SIZE + CELL_SIZE / 2}
            x2={winLine[winLine.length - 1][0] * CELL_SIZE + CELL_SIZE / 2}
            y2={winLine[winLine.length - 1][1] * CELL_SIZE + CELL_SIZE / 2}
            stroke="#FFD700"
            strokeWidth="4"
          />
        )}
      </svg>

      {/* 棋子层 */}
      <div className="pieces-layer">
        {Array.from({ length: BOARD_SIZE }).map((_, x) =>
          Array.from({ length: BOARD_SIZE }).map((_, y) => (
            <div
              key={`cell-${x}-${y}`}
              className="cell"
              style={{
                left: x * CELL_SIZE,
                top: y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
              onClick={() => handleCellClick(x, y)}
              onMouseEnter={() => handleCellHover(x, y)}
              onMouseLeave={handleCellLeave}
            >
              {renderPiece(x, y)}
              {renderHoverPiece(x, y)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameBoard;
