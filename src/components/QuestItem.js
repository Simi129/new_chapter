import React, { useState } from 'react';
import '../styles/QuestItem.css';
import TonConnect from '@tonconnect/sdk'; 

const tonconnect = new TonConnect();

function QuestItem({ quest }) {
  const [buttonText, setButtonText] = useState('Выполнить');
  const [isCompleted, setIsCompleted] = useState(false); 

  const handleButtonClick = async () => {
    if (quest.id === 4) { // Подключение кошелька
      try {
        await tonconnect.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 3600,
          messages: [], 
        });
        setButtonText('Завершено');
        setIsCompleted(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      // ... Логика для выполнения других квестов ...
      setButtonText('Завершено'); 
      setIsCompleted(true);
    }
  };

  return (
    <li className={`quest-item ${isCompleted ? 'completed' : ''}`}>
      <span>{quest.name}</span>
      <span>Награда: {quest.reward} BallCry</span>
      <button 
        className="quest-button" 
        onClick={handleButtonClick}
        disabled={isCompleted} 
      >
        {buttonText}
      </button>
    </li>
  );
}

export default QuestItem;