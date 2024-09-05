import React, { useState, useEffect } from 'react';
import './styles/App.css';
import WalletInfo from './components/WalletInfo';
import QuestList from './components/QuestList';
import TonConnect from '@tonconnect/sdk';
import { SDKProvider, useMainButton, useInitData } from '@telegram-apps/sdk-react';
import { createUser } from './api/userApi';

const tonconnect = new TonConnect();

function AppContent() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const mainButton = useMainButton();
  const initData = useInitData();

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const { account } = await tonconnect.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 3600,
          messages: [],
        });
        setWalletAddress(account);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    };

    connectWallet();

    if (mainButton && initData) {
      mainButton.setText('Начать');
      mainButton.show();
      mainButton.onClick(() => handleCreateUser(initData));
    }

    return () => {
      mainButton?.hide();
      mainButton?.offClick();
    };
  }, [mainButton, initData]);

  const handleCreateUser = async (initData) => {
    try {
      const userData = {
        telegramId: initData.user.id,
        username: initData.user.username,
        walletAddress: walletAddress,
        // Добавьте другие необходимые поля
      };

      await createUser(userData);
      console.log('Пользователь успешно создан');
      mainButton?.hide();
      // Здесь можно добавить дополнительную логику после успешного создания пользователя
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      // Здесь можно добавить обработку ошибки, например, показать уведомление пользователю
    }
  };

  return (
    <div className="app-container">
      <div className="total-balance">
        <span className="balance-value">{tokenBalance}</span>
        <span className="balance-currency">TON</span>
      </div>
      <img className="app-image" src="ball1.png" alt="App Logo" />
      <div className="wallet-info-container">
        <WalletInfo address={walletAddress} />
      </div>
      <QuestList />
      <div className="referral-info">
        Приглашено рефералов: {referralCount}
      </div>
    </div>
  );
}

function App() {
  return (
    <SDKProvider>
      <AppContent />
    </SDKProvider>
  );
}

export default App;