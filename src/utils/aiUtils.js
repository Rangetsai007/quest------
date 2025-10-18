// AI决策工具函数
import { PLAYER, PATTERN_SCORE, SKILL_ID } from '../constants/gameConstants';
import {
  evaluatePosition,
  getEmptyPositions,
  cloneBoard,
  checkWin,
  getPlayerPieces,
  isEmptyPosition,
} from './gameUtils';

/**
 * AI落子决策 - 寻找最佳落子位置
 * @param {number[][]} board - 棋盘状态
 * @param {number} player - AI玩家类型
 * @returns {Array|null} 最佳位置 [x, y] 或 null
 */
export const findBestMove = (board, player) => {
  const opponent = player === PLAYER.BLACK ? PLAYER.WHITE : PLAYER.BLACK;
  const emptyPositions = getEmptyPositions(board);

  if (emptyPositions.length === 0) {
    return null;
  }

  // 如果是第一步,下在中心附近
  if (emptyPositions.length === 225) {
    return [7, 7];
  }

  let bestScore = -Infinity;
  let bestMove = null;
  let criticalMove = null;

  for (const [x, y] of emptyPositions) {
    // 检查是否能直接获胜
    const testBoard = cloneBoard(board);
    testBoard[x][y] = player;
    if (checkWin(testBoard, x, y, player)) {
      return [x, y]; // 立即获胜
    }

    // 检查是否需要防守对手获胜
    testBoard[x][y] = opponent;
    if (checkWin(testBoard, x, y, opponent)) {
      criticalMove = [x, y]; // 必须防守
    }

    // 评估位置分数
    const aiEval = evaluatePosition(board, x, y, player);
    const opponentEval = evaluatePosition(board, x, y, opponent);

    // 综合评分:自己的得分 + 对手的得分*0.8(防守权重稍低)
    const totalScore = aiEval.score + opponentEval.score * 0.8;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMove = [x, y];
    }
  }

  // 如果有必须防守的位置,优先防守
  return criticalMove || bestMove;
};

/**
 * 检查玩家是否有活四(下一步必胜)
 * @param {number[][]} board - 棋盘状态
 * @param {number} player - 玩家类型
 * @returns {Array|null} 活四位置 [x, y] 或 null
 */
export const findAliveFour = (board, player) => {
  const emptyPositions = getEmptyPositions(board);

  for (const [x, y] of emptyPositions) {
    const testBoard = cloneBoard(board);
    testBoard[x][y] = player;
    if (checkWin(testBoard, x, y, player)) {
      return [x, y];
    }
  }

  return null;
};

/**
 * 检查玩家是否有多个活三(双活三)
 * @param {number[][]} board - 棋盘状态
 * @param {number} player - 玩家类型
 * @returns {boolean}
 */
export const hasMultipleAliveThree = (board, player) => {
  const emptyPositions = getEmptyPositions(board);
  let aliveThreeCount = 0;

  for (const [x, y] of emptyPositions) {
    const evaluation = evaluatePosition(board, x, y, player);
    const hasAliveThree = evaluation.patterns.some((p) => p.type === 'ALIVE_THREE');
    if (hasAliveThree) {
      aliveThreeCount++;
      if (aliveThreeCount >= 2) {
        return true;
      }
    }
  }

  return false;
};

/**
 * AI技能使用决策
 * @param {Object} gameState - 游戏状态
 * @param {Object} skillStates - 技能状态
 * @returns {Object|null} 技能使用决策 {skillId, target} 或 null
 */
export const decideSkillUsage = (gameState, skillStates) => {
  const { board, currentPlayer, effectStates } = gameState;
  const opponent = currentPlayer === PLAYER.BLACK ? PLAYER.WHITE : PLAYER.BLACK;

  // 检查对手是否已经被冻结
  const isOpponentFrozen = effectStates && effectStates.frozenPlayer === opponent;
  console.log('AI技能决策:', {
    当前玩家: currentPlayer === PLAYER.BLACK ? '黑棋' : '白棋',
    对手: opponent === PLAYER.BLACK ? '黑棋(玩家)' : '白棋(AI)',
    对手被冻结: isOpponentFrozen
  });

  // 检查对手是否即将获胜
  const opponentWinMove = findAliveFour(board, opponent);
  if (opponentWinMove) {
    // 优先使用飞沙走石移除关键棋子
    if (skillStates[SKILL_ID.FLY_SAND] && !skillStates[SKILL_ID.FLY_SAND].isUsed) {
      const opponentPieces = getPlayerPieces(board, opponent);
      if (opponentPieces.length > 0) {
        // 寻找最有威胁的棋子
        const criticalPiece = findMostCriticalPiece(board, opponent);
        return {
          skillId: SKILL_ID.FLY_SAND,
          target: criticalPiece,
        };
      }
    }

    // 使用静如止水冻结对手（仅当对手未被冻结时）
    if (!isOpponentFrozen && skillStates[SKILL_ID.STILL_WATER] && !skillStates[SKILL_ID.STILL_WATER].isUsed) {
      console.log('AI决定使用静如止水');
      return {
        skillId: SKILL_ID.STILL_WATER,
        target: null,
      };
    }

    // 绝境使用力拔山兮
    if (skillStates[SKILL_ID.MOUNTAIN_POWER] && !skillStates[SKILL_ID.MOUNTAIN_POWER].isUsed) {
      return {
        skillId: SKILL_ID.MOUNTAIN_POWER,
        target: null,
      };
    }
  }

  // 检查对手是否有多个活三（仅当对手未被冻结时）
  if (!isOpponentFrozen && hasMultipleAliveThree(board, opponent)) {
    if (skillStates[SKILL_ID.STILL_WATER] && !skillStates[SKILL_ID.STILL_WATER].isUsed) {
      console.log('AI决定使用静如止水（对手有多个活三）');
      return {
        skillId: SKILL_ID.STILL_WATER,
        target: null,
      };
    }
  }

  return null; // 不使用技能
};

/**
 * 寻找最有威胁的棋子
 * @param {number[][]} board - 棋盘状态
 * @param {number} player - 玩家类型
 * @returns {Array} 棋子位置 [x, y]
 */
const findMostCriticalPiece = (board, player) => {
  const pieces = getPlayerPieces(board, player);
  let maxScore = -Infinity;
  let criticalPiece = pieces[0];

  for (const [x, y] of pieces) {
    // 临时移除这颗棋子,评估影响
    const testBoard = cloneBoard(board);
    testBoard[x][y] = PLAYER.NONE;

    // 检查移除后是否还有获胜威胁
    const stillHasWin = findAliveFour(testBoard, player);
    if (!stillHasWin) {
      // 移除这颗棋子能消除威胁
      return [x, y];
    }

    // 评估这颗棋子的重要性
    const score = evaluatePieceImportance(board, x, y, player);
    if (score > maxScore) {
      maxScore = score;
      criticalPiece = [x, y];
    }
  }

  return criticalPiece;
};

/**
 * 评估棋子的重要性
 * @param {number[][]} board - 棋盘状态
 * @param {number} x - x坐标
 * @param {number} y - y坐标
 * @param {number} player - 玩家类型
 * @returns {number} 重要性分数
 */
const evaluatePieceImportance = (board, x, y, player) => {
  let score = 0;

  // 临时移除棋子
  const originalValue = board[x][y];
  board[x][y] = PLAYER.NONE;

  // 评估周围位置的价值下降
  const neighbors = [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
    [x - 1, y - 1],
    [x + 1, y + 1],
    [x - 1, y + 1],
    [x + 1, y - 1],
  ];

  for (const [nx, ny] of neighbors) {
    if (isEmptyPosition(board, nx, ny)) {
      const evaluation = evaluatePosition(board, nx, ny, player);
      score += evaluation.score;
    }
  }

  // 恢复棋子
  board[x][y] = originalValue;

  return score;
};

/**
 * AI反制技能决策
 * @param {string} opponentSkillId - 对手使用的技能ID
 * @param {Object} skillStates - AI的技能状态
 * @param {Object} gameState - 游戏状态
 * @returns {string|null} 反制技能ID 或 null
 */
export const decideCounterSkill = (opponentSkillId, skillStates, gameState) => {
  // 力拔山兮必须反制
  if (opponentSkillId === SKILL_ID.MOUNTAIN_POWER) {
    if (skillStates[SKILL_ID.POLAR_REVERSE] && !skillStates[SKILL_ID.POLAR_REVERSE].isUsed) {
      return SKILL_ID.POLAR_REVERSE;
    }
  }

  // 飞沙走石根据情况反制
  if (opponentSkillId === SKILL_ID.FLY_SAND) {
    if (skillStates[SKILL_ID.CAPTURE] && !skillStates[SKILL_ID.CAPTURE].isUsed) {
      // 评估是否值得反制(如果被移除的是关键棋子)
      // 简化版:总是反制
      return SKILL_ID.CAPTURE;
    }
  }

  return null;
};
