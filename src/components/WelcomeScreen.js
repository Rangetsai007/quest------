// 欢迎界面组件
import React from 'react';
import './WelcomeScreen.css';

const WelcomeScreen = ({ onStartGame }) => {
  return (
    <div className="welcome-screen">
      <div className="welcome-card">
        <h1 className="welcome-title">技能五子棋</h1>
        <p className="welcome-description">
          传统的五子棋，就是把五个子连成一条线，好无趣，好无聊。而技能五子棋，就是在传统的五子棋，加入技能，好好玩……
        </p>
        <button className="start-button" onClick={onStartGame}>
          开始游戏
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
