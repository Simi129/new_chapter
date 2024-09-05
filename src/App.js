import React, { useState, useEffect } from 'react';
import './styles/App.css';
import WalletInfo from './components/WalletInfo';
import QuestList from './components/QuestList';
import TonConnect from '@tonconnect/sdk';
import { SDKProvider, useMainButton, useInitData, useLaunchParams } from '@telegram-apps/sdk-react';

const tonconnect = new TonConnect();

// Моковые данные для локальной разработки
const mockLaunchParams = {
  start_param: 'test_param'
};

const mockInitData = {
  user: {
    id: 123456789,
    username: 'test_user',
    language_code: 'en'
  }
};

function AppContent() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [isLocalDevelopment, setIsLocalDevelopment] = useState(false);

  // Используем реальные данные в Telegram и моковые при локальной разработке
  const mainButton = useMainButton(isLocalDevelopment);
  const initData = useInitData(isLocalDevelopment ? mockInitData : undefined);
  const launchParams = useLaunchParams(isLocalDevelopment ? mockLaunchParams : undefined);

  useEffect(() => {
    // Проверяем, запущено ли приложение в среде Telegram
    if (!window.Telegram?.WebApp) {
      console.log('Running in local development mode');
      setIsLocalDevelopment(true);
    }

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

    if (launchParams.start_param) {
      console.log('App launched with start_param:', launchParams.start_param);
    }

    if (mainButton) {
      mainButton.setText('Start');
      mainButton.show();
      mainButton.onClick(handleCreateUser);
    }

    return () => {
      mainButton?.hide();
      mainButton?.offClick(handleCreateUser);
    };
  }, [mainButton, launchParams]);

  const handleCreateUser = async () => {
    if (!initData) {
      console.error('Init data is not available');
      return;
    }

    try {
      const response = await fetch('YOUR_API_ENDPOINT/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: initData.user?.id,
          username: initData.user?.username,
          walletAddress: walletAddress,
        }),
      });

      if (response.ok) {
        console.log('User successfully created');
        mainButton?.hide();
      } else {
        console.error('Error creating user');
      }
    } catch (error) {
      console.error('Error sending request:', error);
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