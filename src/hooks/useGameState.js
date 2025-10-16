// 游戏状态管理 Hook
import { useReducer, useCallback } from 'react';
import {
  PLAYER,
  GAME_PHASE,
  GAME_RESULT,
  SKILL_ID,
  SKILLS,
} from '../constants/gameConstants';
import { createEmptyBoard, checkWin, cloneBoard, isEmptyPosition } from '../utils/gameUtils';

// 初始化技能状态
const createInitialSkillStates = (owner) => {
  const skillStates = {};
  Object.keys(SKILLS).forEach((skillId) => {
    skillStates[skillId] = {
      skillId,
      owner,
      isUsed: false,
      isAvailable: true,
      canCounter: false,
      usedAtTurn: null,
    };
  });
  return skillStates;
};

// 初始状态
const initialState = {
  boardState: createEmptyBoard(),
  currentPlayer: PLAYER.BLACK,
  gamePhase: GAME_PHASE.READY,
  winner: GAME_RESULT.NONE,
  moveHistory: [],
  playerSkillStates: createInitialSkillStates(PLAYER.BLACK),
  aiSkillStates: createInitialSkillStates(PLAYER.WHITE),
  effectStates: {
    frozenPlayer: null,
    frozenTurnsLeft: 0,
    removedPieces: [],
    boardBroken: false,
    lastSkillUsed: null,
    pendingCounterSkill: null,
  },
  turnCount: 0,
  winLine: null,
  lastMove: null,
  selectingSkillTarget: null,
};

// Action 类型
const ACTIONS = {
  START_GAME: 'START_GAME',
  PLACE_PIECE: 'PLACE_PIECE',
  USE_SKILL: 'USE_SKILL',
  COUNTER_SKILL: 'COUNTER_SKILL',
  SKIP_COUNTER: 'SKIP_COUNTER',
  SWITCH_PLAYER: 'SWITCH_PLAYER',
  SET_WINNER: 'SET_WINNER',
  RESET_GAME: 'RESET_GAME',
  UPDATE_FROZEN_STATUS: 'UPDATE_FROZEN_STATUS',
  REMOVE_PIECE: 'REMOVE_PIECE',
  RESTORE_PIECE: 'RESTORE_PIECE',
  BREAK_BOARD: 'BREAK_BOARD',
  RESTORE_BOARD: 'RESTORE_BOARD',
  SET_SELECTING_SKILL_TARGET: 'SET_SELECTING_SKILL_TARGET',
};

// Reducer
const gameReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.START_GAME:
      return {
        ...initialState,
        gamePhase: GAME_PHASE.PLAYING,
        boardState: createEmptyBoard(),
      };

    case ACTIONS.PLACE_PIECE: {
      const { x, y, player } = action.payload;

      // 验证落子
      if (!isEmptyPosition(state.boardState, x, y)) {
        return state;
      }

      if (state.effectStates.frozenPlayer === player) {
        return state;
      }

      // 放置棋子
      const newBoard = cloneBoard(state.boardState);
      newBoard[x][y] = player;

      // 检查获胜
      const winResult = checkWin(newBoard, x, y, player);

      const newState = {
        ...state,
        boardState: newBoard,
        moveHistory: [
          ...state.moveHistory,
          { x, y, player, turn: state.turnCount },
        ],
        lastMove: { x, y, player },
        turnCount: state.turnCount + 1,
      };

      if (winResult) {
        newState.gamePhase = GAME_PHASE.ENDED;
        newState.winner =
          player === PLAYER.BLACK ? GAME_RESULT.PLAYER_WIN : GAME_RESULT.AI_WIN;
        newState.winLine = winResult.positions;
      }

      return newState;
    }

    case ACTIONS.USE_SKILL: {
      const { skillId, owner, target } = action.payload;
      const skillStateKey = owner === PLAYER.BLACK ? 'playerSkillStates' : 'aiSkillStates';

      // 标记技能已使用
      const newSkillStates = {
        ...state[skillStateKey],
        [skillId]: {
          ...state[skillStateKey][skillId],
          isUsed: true,
          usedAtTurn: state.turnCount,
        },
      };

      let newState = {
        ...state,
        [skillStateKey]: newSkillStates,
        effectStates: {
          ...state.effectStates,
          lastSkillUsed: { skillId, owner, target },
        },
      };

      // 执行技能效果
      newState = applySkillEffect(newState, skillId, owner, target);

      return newState;
    }

    case ACTIONS.COUNTER_SKILL: {
      const { counterSkillId, owner, targetSkillId } = action.payload;
      const skillStateKey = owner === PLAYER.BLACK ? 'playerSkillStates' : 'aiSkillStates';

      // 标记反制技能已使用
      const newSkillStates = {
        ...state[skillStateKey],
        [counterSkillId]: {
          ...state[skillStateKey][counterSkillId],
          isUsed: true,
          usedAtTurn: state.turnCount,
        },
      };

      // 撤销目标技能的效果
      let newState = {
        ...state,
        [skillStateKey]: newSkillStates,
        effectStates: {
          ...state.effectStates,
          pendingCounterSkill: null,
        },
      };

      newState = revertSkillEffect(newState, targetSkillId);

      return newState;
    }

    case ACTIONS.SKIP_COUNTER:
      return {
        ...state,
        effectStates: {
          ...state.effectStates,
          pendingCounterSkill: null,
        },
      };

    case ACTIONS.SWITCH_PLAYER: {
      const nextPlayer = state.currentPlayer === PLAYER.BLACK ? PLAYER.WHITE : PLAYER.BLACK;

      // 检查下一个玩家是否被冻结
      let newFrozenTurnsLeft = state.effectStates.frozenTurnsLeft;
      let newFrozenPlayer = state.effectStates.frozenPlayer;

      if (state.effectStates.frozenPlayer === nextPlayer && newFrozenTurnsLeft > 0) {
        newFrozenTurnsLeft--;
        if (newFrozenTurnsLeft === 0) {
          newFrozenPlayer = null;
        }
      }

      return {
        ...state,
        currentPlayer: nextPlayer,
        effectStates: {
          ...state.effectStates,
          frozenPlayer: newFrozenPlayer,
          frozenTurnsLeft: newFrozenTurnsLeft,
        },
      };
    }

    case ACTIONS.UPDATE_FROZEN_STATUS: {
      const { player, turnsLeft } = action.payload;
      return {
        ...state,
        effectStates: {
          ...state.effectStates,
          frozenPlayer: player,
          frozenTurnsLeft: turnsLeft,
        },
      };
    }

    case ACTIONS.REMOVE_PIECE: {
      const { x, y } = action.payload;
      const newBoard = cloneBoard(state.boardState);
      const removedPlayer = newBoard[x][y];
      newBoard[x][y] = PLAYER.NONE;

      return {
        ...state,
        boardState: newBoard,
        effectStates: {
          ...state.effectStates,
          removedPieces: [
            ...state.effectStates.removedPieces,
            { x, y, player: removedPlayer, removedAtTurn: state.turnCount },
          ],
        },
      };
    }

    case ACTIONS.RESTORE_PIECE: {
      const { x, y, player } = action.payload;
      const newBoard = cloneBoard(state.boardState);
      newBoard[x][y] = player;

      return {
        ...state,
        boardState: newBoard,
        effectStates: {
          ...state.effectStates,
          removedPieces: state.effectStates.removedPieces.filter(
            (p) => p.x !== x || p.y !== y
          ),
        },
      };
    }

    case ACTIONS.BREAK_BOARD: {
      const { winner } = action.payload;
      return {
        ...state,
        gamePhase: GAME_PHASE.ENDED,
        winner,
        effectStates: {
          ...state.effectStates,
          boardBroken: true,
        },
      };
    }

    case ACTIONS.RESTORE_BOARD:
      return {
        ...state,
        gamePhase: GAME_PHASE.PLAYING,
        winner: GAME_RESULT.NONE,
        effectStates: {
          ...state.effectStates,
          boardBroken: false,
        },
      };

    case ACTIONS.SET_SELECTING_SKILL_TARGET:
      return {
        ...state,
        selectingSkillTarget: action.payload,
      };

    case ACTIONS.RESET_GAME:
      return {
        ...initialState,
        gamePhase: GAME_PHASE.PLAYING,
      };

    default:
      return state;
  }
};

// 应用技能效果
const applySkillEffect = (state, skillId, owner, target) => {
  let newState = { ...state };

  switch (skillId) {
    case SKILL_ID.FLY_SAND:
      if (target && target.x !== undefined && target.y !== undefined) {
        newState = gameReducer(newState, {
          type: ACTIONS.REMOVE_PIECE,
          payload: { x: target.x, y: target.y },
        });
      }
      break;

    case SKILL_ID.PICK_GOLD:
      if (state.effectStates.removedPieces.length > 0) {
        const lastRemoved = state.effectStates.removedPieces[state.effectStates.removedPieces.length - 1];
        newState = gameReducer(newState, {
          type: ACTIONS.RESTORE_PIECE,
          payload: { x: lastRemoved.x, y: lastRemoved.y, player: lastRemoved.player },
        });
      }
      break;

    case SKILL_ID.STILL_WATER: {
      const targetPlayer = owner === PLAYER.BLACK ? PLAYER.WHITE : PLAYER.BLACK;
      newState = gameReducer(newState, {
        type: ACTIONS.UPDATE_FROZEN_STATUS,
        payload: { player: targetPlayer, turnsLeft: 2 },
      });
      break;
    }

    case SKILL_ID.WATER_DROP:
      newState = gameReducer(newState, {
        type: ACTIONS.UPDATE_FROZEN_STATUS,
        payload: { player: null, turnsLeft: 0 },
      });
      break;

    case SKILL_ID.MOUNTAIN_POWER: {
      const winner = owner === PLAYER.BLACK ? GAME_RESULT.BOARD_BROKEN_PLAYER : GAME_RESULT.BOARD_BROKEN_AI;
      newState = gameReducer(newState, {
        type: ACTIONS.BREAK_BOARD,
        payload: { winner },
      });
      break;
    }

    case SKILL_ID.RISE_AGAIN:
      newState = gameReducer(newState, {
        type: ACTIONS.RESTORE_BOARD,
        payload: {},
      });
      break;

    default:
      break;
  }

  return newState;
};

// 撤销技能效果
const revertSkillEffect = (state, skillId) => {
  let newState = { ...state };

  switch (skillId) {
    case SKILL_ID.FLY_SAND:
      // 擒擒拿拿阻止飞沙走石,恢复被移除的棋子
      if (state.effectStates.removedPieces.length > 0) {
        const lastRemoved = state.effectStates.removedPieces[state.effectStates.removedPieces.length - 1];
        newState = gameReducer(newState, {
          type: ACTIONS.RESTORE_PIECE,
          payload: { x: lastRemoved.x, y: lastRemoved.y, player: lastRemoved.player },
        });
      }
      break;

    case SKILL_ID.MOUNTAIN_POWER:
      // 两极反转阻止力拔山兮
      newState = gameReducer(newState, {
        type: ACTIONS.RESTORE_BOARD,
        payload: {},
      });
      break;

    default:
      break;
  }

  return newState;
};

// Hook
export const useGameState = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback(() => {
    dispatch({ type: ACTIONS.START_GAME });
  }, []);

  const placePiece = useCallback((x, y, player) => {
    dispatch({ type: ACTIONS.PLACE_PIECE, payload: { x, y, player } });
  }, []);

  const useSkill = useCallback((skillId, owner, target = null) => {
    dispatch({ type: ACTIONS.USE_SKILL, payload: { skillId, owner, target } });
  }, []);

  const counterSkill = useCallback((counterSkillId, owner, targetSkillId) => {
    dispatch({ type: ACTIONS.COUNTER_SKILL, payload: { counterSkillId, owner, targetSkillId } });
  }, []);

  const skipCounter = useCallback(() => {
    dispatch({ type: ACTIONS.SKIP_COUNTER });
  }, []);

  const switchPlayer = useCallback(() => {
    dispatch({ type: ACTIONS.SWITCH_PLAYER });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_GAME });
  }, []);

  const setSelectingSkillTarget = useCallback((skillData) => {
    dispatch({ type: ACTIONS.SET_SELECTING_SKILL_TARGET, payload: skillData });
  }, []);

  return {
    state,
    actions: {
      startGame,
      placePiece,
      useSkill,
      counterSkill,
      skipCounter,
      switchPlayer,
      resetGame,
      setSelectingSkillTarget,
    },
  };
};
