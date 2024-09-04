import React from 'react';
import '../styles/QuestList.css';
import QuestItem from './QuestItem';

function QuestList() {
  const quests = [
    { id: 1, name: 'Подпишись на официальный канал телеграм', reward: 200 },
    { id: 2, name: 'Ежедневный бонус', reward: 100 },
    { id: 3, name: 'Пригласи 5 друзей', reward: 800 },
    { id: 4, name: 'Подключи кошелёк', reward: 150 },
    { id: 5, name: 'Выставь историю в инстаграм со своим любимым клубом и хештегом BallCry', reward: 300 },
    { id: 6, name: 'Подпишись на канал в X', reward: 100 },
    { id: 7, name: 'Соверши транзакцию Ton', reward: 250 },
  ];

  return (
    <ul className="quest-list">
      {quests.map(quest => (
        <QuestItem key={quest.id} quest={quest} />
      ))}
    </ul>
  );
}

export default QuestList;