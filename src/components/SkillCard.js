// 技能卡片组件
import React, { useState } from 'react';
import { SKILLS } from '../constants/gameConstants';
import './SkillCard.css';

const SkillCard = ({
  skillId,
  skillState,
  onClick,
  canCounter,
  disabled,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const skill = SKILLS[skillId];

  if (!skill) return null;

  const { isUsed, isAvailable } = skillState;

  const handleClick = () => {
    if (disabled || isUsed || !isAvailable) return;
    onClick(skillId);
  };

  const getCardClassName = () => {
    const classes = ['skill-card'];
    
    if (isUsed) {
      classes.push('used');
    } else if (!isAvailable) {
      classes.push('unavailable');
    } else if (canCounter) {
      classes.push('can-counter');
    } else {
      classes.push('available');
    }

    if (disabled) {
      classes.push('disabled');
    }

    return classes.join(' ');
  };

  const getUnavailableReason = () => {
    if (isUsed) return '已使用';
    if (!isAvailable) {
      if (skill.requireCondition === 'PIECE_REMOVED') {
        return '需要对手使用飞沙走石';
      }
      if (skill.requireCondition === 'FROZEN') {
        return '需要被静如止水控制';
      }
      if (skill.requireCondition === 'BOARD_BROKEN') {
        return '需要棋盘被摔坏';
      }
      return '条件未满足';
    }
    return '';
  };

  return (
    <div
      className={getCardClassName()}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="skill-icon">
        {skill.name.substring(0, 2)}
      </div>
      <div className="skill-name">{skill.name}</div>
      
      {isUsed && <div className="used-mark">✓</div>}
      {canCounter && <div className="counter-mark">!</div>}

      {showTooltip && (
        <div className="skill-tooltip">
          <div className="tooltip-title">{skill.name}</div>
          <div className="tooltip-type">{getSkillTypeText(skill.type)}</div>
          <div className="tooltip-description">{skill.description}</div>
          {!isAvailable && (
            <div className="tooltip-reason">{getUnavailableReason()}</div>
          )}
          {canCounter && (
            <div className="tooltip-counter">可反制对手技能!</div>
          )}
        </div>
      )}
    </div>
  );
};

const getSkillTypeText = (type) => {
  const typeMap = {
    ATTACK: '进攻型',
    DEFENSE: '防御型',
    COUNTER: '反制型',
    CONTROL: '控制型',
    DECONTROL: '解控型',
    FINISHER: '终结型',
    SUPPRESS: '克制型',
    REVIVE: '复活型',
  };
  return typeMap[type] || type;
};

export default SkillCard;
