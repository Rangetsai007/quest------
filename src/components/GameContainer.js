// 游戏容器组件 - 主要游戏逻辑
import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../hooks/useGameState';
import GameBoard from './GameBoard';
import SkillPanel from './SkillPanel';
import ModalManager from './ModalManager';
import {
  PLAYER,
  GAME_PHASE,
  SKILL_ID,
  SKILLS,
  MODAL_TYPE,
} from '../constants/gameConstants';
import { findBestMove, decideSkillUsage, decideCounterSkill } from '../utils/aiUtils';
import './GameContainer.css';

const GameContainer = ({ onBackToWelcome }) => {
  const { state, actions } = useGameState();
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [pendingSkill, setPendingSkill] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 开始游戏 - 只在组件挂载时执行一次
  useEffect(() => {
    actions.startGame();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // AI回合处理
  useEffect(() => {
    if (
      state.gamePhase === GAME_PHASE.PLAYING &&
      state.currentPlayer === PLAYER.WHITE &&
      !isProcessing &&
      !modalType
    ) {
      handleAITurn();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentPlayer, state.gamePhase, isProcessing, modalType]);

  // 检查游戏是否结束
  useEffect(() => {
    if (state.gamePhase === GAME_PHASE.ENDED && !modalType) {
      setTimeout(() => {
        setModalType(MODAL_TYPE.GAME_OVER);
        setModalData({ winner: state.winner });
      }, 1000);
    }
  }, [state.gamePhase, state.winner, modalType]);

  // 更新技能可用性
  useEffect(() => {
    updateSkillAvailability();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.effectStates]);

  // AI回合处理
  const handleAITurn = useCallback(async () => {
    setIsProcessing(true);

    try {
      // 检查AI是否被冻结
      if (state.effectStates.frozenPlayer === PLAYER.WHITE) {
        console.log('AI被冻结，检查是否可使用水滴石穿');
        
        // 被冻结时，检查是否可以使用水滴石穿
        if (state.aiSkillStates[SKILL_ID.WATER_DROP] && 
            !state.aiSkillStates[SKILL_ID.WATER_DROP].isUsed &&
            state.aiSkillStates[SKILL_ID.WATER_DROP].isAvailable) {
          console.log('AI决定使用水滴石穿解除冻结');
          await new Promise((resolve) => setTimeout(resolve, 500));
          actions.useSkill(SKILL_ID.WATER_DROP, PLAYER.WHITE);
          await new Promise((resolve) => setTimeout(resolve, 500));
          // 解除冻结后继续正常流程
        } else {
          // 没有水滴石穿或已使用，跳过回合
          console.log('AI被冻结且无法解除，跳过回合');
          await new Promise((resolve) => setTimeout(resolve, 1000));
          actions.switchPlayer();
          return;
        }
      }

      // AI技能决策
      const skillDecision = decideSkillUsage(
        { 
          board: state.boardState, 
          currentPlayer: PLAYER.WHITE,
          effectStates: state.effectStates  // 传递冻结状态
        },
        state.aiSkillStates
      );

      if (skillDecision) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // 检查玩家是否可以反制
        const skill = SKILLS[skillDecision.skillId];
        if (skill.canBeCountered) {
          const counterSkill = skill.counterSkills.find(
            (csId) => !state.playerSkillStates[csId].isUsed
          );
          
          if (counterSkill) {
            // 显示反制弹窗
            setModalType(MODAL_TYPE.COUNTER_SKILL);
            setModalData({
              opponentSkillId: skillDecision.skillId,
              counterSkillId: counterSkill,
            });
            setPendingSkill({ ...skillDecision, owner: PLAYER.WHITE });
            return;
          }
        }

        // 执行AI技能
        actions.useSkill(skillDecision.skillId, PLAYER.WHITE, skillDecision.target);
        
        // 检查是否游戏结束
        if (state.effectStates.boardBroken) {
          return;
        }
      }

      // AI落子
      await new Promise((resolve) => setTimeout(resolve, 800));
      const bestMove = findBestMove(state.boardState, PLAYER.WHITE);
      
      if (bestMove) {
        const [x, y] = bestMove;
        actions.placePiece(x, y, PLAYER.WHITE);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      actions.switchPlayer();
    } catch (error) {
      console.error('AI回合错误:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [state, actions]);

  // 处理技能目标选择
  const handleSkillTarget = useCallback((x, y) => {
    const { skillId } = state.selectingSkillTarget;

    if (skillId === SKILL_ID.FLY_SAND) {
      // 必须选择对手的棋子
      if (state.boardState[x][y] !== PLAYER.WHITE) {
        return;
      }

      // 执行技能
      actions.useSkill(skillId, PLAYER.BLACK, { x, y });
      actions.setSelectingSkillTarget(null);
      setModalType(null);
    }
  }, [state, actions]);

  // 玩家点击棋盘
  const handleCellClick = useCallback((x, y) => {
    console.log('点击棋盘:', { 
      x, y, 
      gamePhase: state.gamePhase, 
      currentPlayer: state.currentPlayer,
      frozenPlayer: state.effectStates.frozenPlayer,
      isProcessing,
      selectingSkillTarget: state.selectingSkillTarget,
      cellValue: state.boardState[x][y]
    });

    if (state.gamePhase !== GAME_PHASE.PLAYING) {
      console.log('游戏未在进行中，当前阶段:', state.gamePhase);
      return;
    }
    if (state.currentPlayer !== PLAYER.BLACK) {
      console.log('不是玩家回合，当前玩家:', state.currentPlayer);
      return;
    }
    if (state.effectStates.frozenPlayer === PLAYER.BLACK) {
      console.log('玩家被冻结');
      return;
    }
    if (isProcessing) {
      console.log('正在处理中');
      return;
    }

    // 如果正在选择技能目标
    if (state.selectingSkillTarget) {
      handleSkillTarget(x, y);
      return;
    }

    // 普通落子
    if (state.boardState[x][y] !== PLAYER.NONE) {
      console.log('位置已被占用');
      return;
    }

    console.log('执行落子');
    actions.placePiece(x, y, PLAYER.BLACK);
    
    // 检查是否获胜
    if (state.gamePhase !== GAME_PHASE.ENDED) {
      setTimeout(() => {
        actions.switchPlayer();
      }, 300);
    }
  }, [state, actions, isProcessing, handleSkillTarget]);

  // 玩家点击技能
  const handlePlayerSkillClick = useCallback((skillId) => {
    console.log('玩家点击技能:', skillId, '当前冻结状态:', state.effectStates.frozenPlayer === PLAYER.BLACK);
    
    if (state.currentPlayer !== PLAYER.BLACK) return;
    if (isProcessing) return;

    const skillState = state.playerSkillStates[skillId];
    if (skillState.isUsed || !skillState.isAvailable) return;

    // 被冻结时，只允许使用解控技能（水滴石穿）
    if (state.effectStates.frozenPlayer === PLAYER.BLACK) {
      if (skillId !== SKILL_ID.WATER_DROP) {
        console.log('被冻结时只能使用水滴石穿');
        return;
      }
      console.log('允许使用水滴石穿解除冻结');
    }

    // 静如止水：检查对手是否已被冻结
    if (skillId === SKILL_ID.STILL_WATER) {
      if (state.effectStates.frozenPlayer === PLAYER.WHITE) {
        console.log('对手已被冻结，无法使用静如止水');
        return;
      }
    }

    // 需要选择目标的技能
    if (skillId === SKILL_ID.FLY_SAND) {
      setModalType(MODAL_TYPE.SKILL_SELECT_TARGET);
      setModalData({ skillId });
      actions.setSelectingSkillTarget({ skillId, owner: PLAYER.BLACK });
      return;
    }

    // 其他技能显示确认弹窗
    setPendingSkill({ skillId, owner: PLAYER.BLACK });
    setModalType(MODAL_TYPE.SKILL_CONFIRM);
    setModalData({ skillId });
  }, [state, actions, isProcessing]);

  // 确认使用技能
  const handleConfirmSkill = useCallback(async () => {
    if (!pendingSkill) return;

    const { skillId, owner } = pendingSkill;
    setModalType(null);
    setPendingSkill(null);

    // 检查对手是否可以反制
    const skill = SKILLS[skillId];
    if (skill.canBeCountered) {
      const opponentSkillStates = owner === PLAYER.BLACK ? state.aiSkillStates : state.playerSkillStates;
      const counterSkill = skill.counterSkills.find(
        (csId) => !opponentSkillStates[csId].isUsed
      );

      if (counterSkill && owner === PLAYER.BLACK) {
        // AI自动决策是否反制
        const counterDecision = decideCounterSkill(skillId, state.aiSkillStates, state);
        
        if (counterDecision) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          actions.counterSkill(counterDecision, PLAYER.WHITE, skillId);
          return;
        }
      }
    }

    // 执行技能
    actions.useSkill(skillId, owner);
  }, [pendingSkill, state, actions]);

  // 取消技能
  const handleCancelSkill = useCallback(() => {
    setModalType(null);
    setModalData(null);
    setPendingSkill(null);
    actions.setSelectingSkillTarget(null);
  }, [actions]);

  // 玩家反制技能
  const handleCounterSkill = useCallback(() => {
    if (!modalData) return;

    const { counterSkillId, opponentSkillId } = modalData;
    
    // 执行反制
    actions.counterSkill(counterSkillId, PLAYER.BLACK, opponentSkillId);
    
    setModalType(null);
    setModalData(null);
    setPendingSkill(null);
    setIsProcessing(false);
  }, [modalData, actions]);

  // 跳过反制
  const handleSkipCounter = useCallback(async () => {
    if (!pendingSkill) return;

    const { skillId, owner, target } = pendingSkill;
    
    // 执行对手技能
    actions.useSkill(skillId, owner, target);
    
    setModalType(null);
    setModalData(null);
    setPendingSkill(null);
    setIsProcessing(false);

    // 如果是AI技能,继续AI回合
    if (owner === PLAYER.WHITE && state.gamePhase === GAME_PHASE.PLAYING) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const bestMove = findBestMove(state.boardState, PLAYER.WHITE);
      
      if (bestMove) {
        const [x, y] = bestMove;
        actions.placePiece(x, y, PLAYER.WHITE);
      }

      await new Promise((resolve) => setTimeout(resolve, 500));
      actions.switchPlayer();
    }
  }, [pendingSkill, state, actions]);

  // 重新开始游戏
  const handleRestart = useCallback(() => {
    setModalType(null);
    setModalData(null);
    setPendingSkill(null);
    setIsProcessing(false);
    actions.resetGame();
  }, [actions]);

  // 更新技能可用性
  const updateSkillAvailability = useCallback(() => {
    // 这里可以根据effectStates更新技能的可用性
    // 例如:拾金不昧需要有被移除的棋子
    // 当前在useGameState中已经处理,这里保留以备扩展
  }, []);

  // 获取反制技能ID
  const getCounterSkillId = (owner) => {
    if (!modalType || modalType !== MODAL_TYPE.COUNTER_SKILL) return null;
    if (!modalData) return null;
    
    if (owner === PLAYER.BLACK) {
      return modalData.counterSkillId;
    }
    return null;
  };

  const isPlayerFrozen = state.effectStates.frozenPlayer === PLAYER.BLACK;
  const isAIFrozen = state.effectStates.frozenPlayer === PLAYER.WHITE;

  return (
    <div className="game-container">
      <div className="game-title">
        <h1>⚔️ 技能五子棋 ⚔️</h1>
        <div className="game-status">
          {state.gamePhase === GAME_PHASE.PLAYING && (
            <>
              <span className="turn-indicator">
                当前回合: {state.currentPlayer === PLAYER.BLACK ? '玩家(黑)' : 'AI(白)'}
              </span>
              {isPlayerFrozen && (
                <span className="frozen-notice">❄️ 玩家被冻结 {state.effectStates.frozenTurnsLeft} 回合</span>
              )}
              {isAIFrozen && (
                <span className="frozen-notice">❄️ AI被冻结 {state.effectStates.frozenTurnsLeft} 回合</span>
              )}
            </>
          )}
        </div>
      </div>

      <div className="game-main">
        {/* AI技能面板 */}
        <SkillPanel
          owner={PLAYER.WHITE}
          skillStates={state.aiSkillStates}
          onSkillClick={() => {}}
          counterSkillId={getCounterSkillId(PLAYER.WHITE)}
          disabled={isAIFrozen}
          position="left"
        />

        {/* 游戏棋盘 */}
        <GameBoard
          boardState={state.boardState}
          currentPlayer={state.currentPlayer}
          lastMove={state.lastMove}
          winLine={state.winLine}
          onCellClick={handleCellClick}
          selectingSkillTarget={state.selectingSkillTarget}
          disabled={isProcessing || state.gamePhase === GAME_PHASE.ENDED}
        />

        {/* 玩家技能面板 */}
        <SkillPanel
          owner={PLAYER.BLACK}
          skillStates={state.playerSkillStates}
          onSkillClick={handlePlayerSkillClick}
          counterSkillId={getCounterSkillId(PLAYER.BLACK)}
          disabled={isPlayerFrozen}
          position="right"
        />
      </div>

      {/* 弹窗管理器 */}
      <ModalManager
        modalType={modalType}
        modalData={modalData}
        onConfirmSkill={handleConfirmSkill}
        onCancelSkill={handleCancelSkill}
        onCounterSkill={handleCounterSkill}
        onSkipCounter={handleSkipCounter}
        onRestart={handleRestart}
        onExit={onBackToWelcome}
      />
    </div>
  );
};

export default GameContainer;
