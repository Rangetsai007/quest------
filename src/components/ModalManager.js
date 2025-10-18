// 弹窗管理器组件
import React, { useEffect, useState } from 'react';
import { MODAL_TYPE, SKILLS, COUNTER_SKILL_TIMEOUT } from '../constants/gameConstants';
import './Modal.css';

// 技能确认弹窗
export const SkillConfirmModal = ({ skillId, onConfirm, onCancel }) => {
  const skill = SKILLS[skillId];

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content pixel-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>使用技能</h2>
        </div>
        <div className="modal-body">
          <div className="skill-info">
            <div className="skill-name-large">{skill.name}</div>
            <div className="skill-description">{skill.description}</div>
          </div>
          <div className="confirm-text">确认使用此技能?</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onConfirm}>
            确认
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

// 反制技能弹窗
export const CounterSkillModal = ({ 
  opponentSkillId, 
  counterSkillId, 
  onCounter, 
  onSkip 
}) => {
  const [timeLeft, setTimeLeft] = useState(COUNTER_SKILL_TIMEOUT);
  const opponentSkill = SKILLS[opponentSkillId];
  const counterSkill = SKILLS[counterSkillId];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onSkip();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onSkip]);

  return (
    <div className="modal-overlay">
      <div className="modal-content pixel-box counter-modal">
        <div className="modal-header">
          <h2>反制技能!</h2>
          <div className="countdown">{timeLeft}秒</div>
        </div>
        <div className="modal-body">
          <div className="opponent-skill">
            <p>对手使用了:</p>
            <div className="skill-name-large warning">{opponentSkill.name}</div>
          </div>
          <div className="counter-option">
            <p>是否使用 <span className="highlight">{counterSkill.name}</span> 反制?</p>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-danger" onClick={onCounter}>
            立即反制
          </button>
          <button className="btn btn-secondary" onClick={onSkip}>
            放弃
          </button>
        </div>
      </div>
    </div>
  );
};

// 游戏结束弹窗
export const GameOverModal = ({ winner, onRestart, onExit }) => {
  const getResultText = () => {
    switch (winner) {
      case 'PLAYER_WIN':
        return { title: '🎉 胜利!', message: '恭喜你获得了胜利!', color: '#4caf50' };
      case 'AI_WIN':
        return { title: '😢 失败', message: 'AI获得了胜利,再接再厉!', color: '#f44336' };
      case 'BOARD_BROKEN_PLAYER':
        return { title: '💥 力拔山兮!', message: '你摔坏了棋盘,获得胜利!', color: '#FFD700' };
      case 'BOARD_BROKEN_AI':
        return { title: '💥 力拔山兮!', message: 'AI摔坏了棋盘,你失败了!', color: '#f44336' };
      case 'DRAW':
        return { title: '🤝 平局', message: '棋盘已满,平局!', color: '#ff9800' };
      default:
        return { title: '游戏结束', message: '', color: '#666' };
    }
  };

  const result = getResultText();

  return (
    <div className="modal-overlay">
      <div className="modal-content pixel-box game-over-modal">
        <div className="modal-header" style={{ borderBottomColor: result.color }}>
          <h2 style={{ color: result.color }}>{result.title}</h2>
        </div>
        <div className="modal-body">
          <p className="result-message">{result.message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onRestart}>
            再来一局
          </button>
          {onExit && (
            <button className="btn btn-secondary" onClick={onExit}>
              返回首页
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 选择目标弹窗
export const SelectTargetModal = ({ skillId, onCancel }) => {
  const skill = SKILLS[skillId];

  return (
    <div className="modal-overlay select-target-overlay">
      <div className="select-target-hint pixel-box">
        <div className="hint-title">{skill.name}</div>
        <div className="hint-text">
          {skillId === 'SKILL_01' && '请点击要移除的对手棋子'}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
};

// 弹窗管理器
const ModalManager = ({
  modalType,
  modalData,
  onConfirmSkill,
  onCancelSkill,
  onCounterSkill,
  onSkipCounter,
  onRestart,
  onExit,
}) => {
  if (!modalType) return null;

  switch (modalType) {
    case MODAL_TYPE.SKILL_CONFIRM:
      return (
        <SkillConfirmModal
          skillId={modalData.skillId}
          onConfirm={onConfirmSkill}
          onCancel={onCancelSkill}
        />
      );

    case MODAL_TYPE.COUNTER_SKILL:
      return (
        <CounterSkillModal
          opponentSkillId={modalData.opponentSkillId}
          counterSkillId={modalData.counterSkillId}
          onCounter={onCounterSkill}
          onSkip={onSkipCounter}
        />
      );

    case MODAL_TYPE.GAME_OVER:
      return (
        <GameOverModal
          winner={modalData.winner}
          onRestart={onRestart}
          onExit={onExit}
        />
      );

    case MODAL_TYPE.SKILL_SELECT_TARGET:
      return (
        <SelectTargetModal
          skillId={modalData.skillId}
          onCancel={onCancelSkill}
        />
      );

    default:
      return null;
  }
};

export default ModalManager;
