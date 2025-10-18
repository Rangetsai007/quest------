// App 主组件
import React, { useState } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GameContainer from './components/GameContainer';
import './App.css';

function App() {
  const [gamePhase, setGamePhase] = useState('WELCOME'); // 'WELCOME' | 'PLAYING'

  const handleStartGame = () => {
    setGamePhase('PLAYING');
  };

  const handleBackToWelcome = () => {
    setGamePhase('WELCOME');
  };

  return (
    <div className="App">
      {gamePhase === 'WELCOME' ? (
        <WelcomeScreen onStartGame={handleStartGame} />
      ) : (
        <GameContainer onBackToWelcome={handleBackToWelcome} />
      )}
    </div>
  );
}

export default App;
