// 技能面板组件
import React from 'react';
import SkillCard from './SkillCard';
import { SKILL_ID, PLAYER } from '../constants/gameConstants';
import './SkillPanel.css';

const SkillPanel = ({
  owner,
  skillStates,
  onSkillClick,
  counterSkillId,
  disabled,
  position, // 'left' or 'right'
}) => {
  const skillIds = Object.values(SKILL_ID);

  const isPlayerPanel = owner === PLAYER.BLACK;
  const avatarText = isPlayerPanel ? '玩家' : 'AI';

  return (
    <div className={`skill-panel ${position}`}>
      <div className="panel-header">
        <div className={`avatar ${isPlayerPanel ? 'player' : 'ai'}`}>
          {avatarText}
        </div>
        <div className="panel-title">
          {isPlayerPanel ? '玩家技能' : 'AI技能'}
        </div>
      </div>

      <div className="skills-container">
        {skillIds.map((skillId) => {
          const skillState = skillStates[skillId];
          const canCounter = counterSkillId === skillId;

          return (
            <SkillCard
              key={skillId}
              skillId={skillId}
              skillState={skillState}
              onClick={onSkillClick}
              canCounter={canCounter}
              disabled={disabled}
            />
          );
        })}
      </div>

      {disabled && (
        <div className="frozen-overlay">
          <div className="frozen-text">❄️ 被冻结 ❄️</div>
        </div>
      )}
    </div>
  );
};

export default SkillPanel;
