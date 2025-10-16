// 游戏工具函数
import { BOARD_SIZE, WIN_COUNT, DIRECTIONS, PLAYER } from '../constants/gameConstants';

/**
 * 创建空棋盘
 * @returns {number[][]} 15x15的二维数组,初始值为0
 */
export const createEmptyBoard = () => {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(PLAYER.NONE));
};

/**
 * 检查位置是否在棋盘范围内
 * @param {number} x - x坐标
 * @param {number} y - y坐标
 * @returns {boolean}
 */
export const isValidPosition = (x, y) => {
  return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE;
};

/**
 * 检查位置是否为空
 * @param {number[][]} board - 棋盘状态
 * @param {number} x - x坐标
 * @param {number} y - y坐标
 * @returns {boolean}
 */
export const isEmptyPosition = (board, x, y) => {
  return isValidPosition(x, y) && board[x][y] === PLAYER.NONE;
};

/**
 * 检查是否获胜
 * @param {number[][]} board - 棋盘状态
 * @param {number} x - 最后落子的x坐标
 * @param {number} y - 最后落子的y坐标
 * @param {number} player - 玩家类型
 * @returns {Object|null} 获胜信息 {direction, positions} 或 null
 */
export const checkWin = (board, x, y, player) => {
  if (!isValidPosition(x, y) || board[x][y] !== player) {
    return null;
  }

  // 检查四个方向
  for (const [dx, dy] of DIRECTIONS) {
    const positions = [];
    let count = 1;

    // 向正方向延伸
    let i = 1;
    while (
      isValidPosition(x + dx * i, y + dy * i) &&
      board[x + dx * i][y + dy * i] === player
    ) {
      positions.push([x + dx * i, y + dy * i]);
      count++;
      i++;
    }

    // 向反方向延伸
    i = 1;
    while (
      isValidPosition(x - dx * i, y - dy * i) &&
      board[x - dx * i][y - dy * i] === player
    ) {
      positions.unshift([x - dx * i, y - dy * i]);
      count++;
      i++;
    }

    if (count >= WIN_COUNT) {
      // 添加中心点
      positions.splice(positions.length / 2, 0, [x, y]);
      return {
        direction: [dx, dy],
        positions: positions.slice(0, WIN_COUNT),
      };
    }
  }

  return null;
};

/**
 * 检查棋盘是否已满
 * @param {number[][]} board - 棋盘状态
 * @returns {boolean}
 */
export const isBoardFull = (board) => {
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === PLAYER.NONE) {
        return false;
      }
    }
  }
  return true;
};

/**
 * 深拷贝棋盘
 * @param {number[][]} board - 原棋盘
 * @returns {number[][]} 新棋盘
 */
export const cloneBoard = (board) => {
  return board.map((row) => [...row]);
};

/**
 * 获取某个方向上的连续棋子数
 * @param {number[][]} board - 棋盘状态
 * @param {number} x - 起始x坐标
 * @param {number} y - 起始y坐标
 * @param {number} dx - x方向增量
 * @param {number} dy - y方向增量
 * @param {number} player - 玩家类型
 * @returns {number} 连续棋子数
 */
export const getLineCount = (board, x, y, dx, dy, player) => {
  let count = 0;
  let i = 0;

  while (
    isValidPosition(x + dx * i, y + dy * i) &&
    board[x + dx * i][y + dy * i] === player
  ) {
    count++;
    i++;
  }

  return count;
};

/**
 * 评估某个位置的棋型
 * @param {number[][]} board - 棋盘状态
 * @param {number} x - x坐标
 * @param {number} y - y坐标
 * @param {number} player - 玩家类型
 * @returns {Object} 棋型评估结果
 */
export const evaluatePosition = (board, x, y, player) => {
  if (!isEmptyPosition(board, x, y)) {
    return { score: 0, patterns: [] };
  }

  let totalScore = 0;
  const patterns = [];

  // 检查四个方向
  for (const [dx, dy] of DIRECTIONS) {
    const forwardCount = getLineCount(board, x + dx, y + dy, dx, dy, player);
    const backwardCount = getLineCount(board, x - dx, y - dy, -dx, -dy, player);
    const totalCount = forwardCount + backwardCount + 1;

    if (totalCount >= WIN_COUNT) {
      patterns.push({ type: 'FIVE', direction: [dx, dy] });
      totalScore += 100000;
    } else if (totalCount === 4) {
      // 判断是活四还是冲四
      const forwardBlocked =
        !isValidPosition(x + dx * (forwardCount + 1), y + dy * (forwardCount + 1)) ||
        (board[x + dx * (forwardCount + 1)][y + dy * (forwardCount + 1)] !== PLAYER.NONE &&
          board[x + dx * (forwardCount + 1)][y + dy * (forwardCount + 1)] !== player);

      const backwardBlocked =
        !isValidPosition(x - dx * (backwardCount + 1), y - dy * (backwardCount + 1)) ||
        (board[x - dx * (backwardCount + 1)][y - dy * (backwardCount + 1)] !== PLAYER.NONE &&
          board[x - dx * (backwardCount + 1)][y - dy * (backwardCount + 1)] !== player);

      if (!forwardBlocked && !backwardBlocked) {
        patterns.push({ type: 'ALIVE_FOUR', direction: [dx, dy] });
        totalScore += 10000;
      } else if (!forwardBlocked || !backwardBlocked) {
        patterns.push({ type: 'RUSH_FOUR', direction: [dx, dy] });
        totalScore += 5000;
      }
    } else if (totalCount === 3) {
      // 判断是活三还是眠三
      const forwardBlocked =
        !isValidPosition(x + dx * (forwardCount + 1), y + dy * (forwardCount + 1)) ||
        (board[x + dx * (forwardCount + 1)][y + dy * (forwardCount + 1)] !== PLAYER.NONE &&
          board[x + dx * (forwardCount + 1)][y + dy * (forwardCount + 1)] !== player);

      const backwardBlocked =
        !isValidPosition(x - dx * (backwardCount + 1), y - dy * (backwardCount + 1)) ||
        (board[x - dx * (backwardCount + 1)][y - dy * (backwardCount + 1)] !== PLAYER.NONE &&
          board[x - dx * (backwardCount + 1)][y - dy * (backwardCount + 1)] !== player);

      if (!forwardBlocked && !backwardBlocked) {
        patterns.push({ type: 'ALIVE_THREE', direction: [dx, dy] });
        totalScore += 2000;
      } else if (!forwardBlocked || !backwardBlocked) {
        patterns.push({ type: 'SLEEP_THREE', direction: [dx, dy] });
        totalScore += 500;
      }
    } else if (totalCount === 2) {
      const forwardBlocked =
        !isValidPosition(x + dx * (forwardCount + 1), y + dy * (forwardCount + 1)) ||
        (board[x + dx * (forwardCount + 1)][y + dy * (forwardCount + 1)] !== PLAYER.NONE &&
          board[x + dx * (forwardCount + 1)][y + dy * (forwardCount + 1)] !== player);

      const backwardBlocked =
        !isValidPosition(x - dx * (backwardCount + 1), y - dy * (backwardCount + 1)) ||
        (board[x - dx * (backwardCount + 1)][y - dy * (backwardCount + 1)] !== PLAYER.NONE &&
          board[x - dx * (backwardCount + 1)][y - dy * (backwardCount + 1)] !== player);

      if (!forwardBlocked && !backwardBlocked) {
        patterns.push({ type: 'ALIVE_TWO', direction: [dx, dy] });
        totalScore += 200;
      } else if (!forwardBlocked || !backwardBlocked) {
        patterns.push({ type: 'SLEEP_TWO', direction: [dx, dy] });
        totalScore += 50;
      }
    }
  }

  return { score: totalScore, patterns };
};

/**
 * 获取所有空位置
 * @param {number[][]} board - 棋盘状态
 * @returns {Array} 空位置数组 [[x, y], ...]
 */
export const getEmptyPositions = (board) => {
  const positions = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === PLAYER.NONE) {
        positions.push([i, j]);
      }
    }
  }
  return positions;
};

/**
 * 获取所有指定玩家的棋子位置
 * @param {number[][]} board - 棋盘状态
 * @param {number} player - 玩家类型
 * @returns {Array} 棋子位置数组 [[x, y], ...]
 */
export const getPlayerPieces = (board, player) => {
  const pieces = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] === player) {
        pieces.push([i, j]);
      }
    }
  }
  return pieces;
};
