import React, { useState, useEffect } from 'react';
import './styles/App.css';
import WalletInfo from './components/WalletInfo';
import QuestList from './components/QuestList';
import TonConnect from '@tonconnect/sdk';
import { SDKProvider, useMainButton, useInitData, useLaunchParams } from '@telegram-apps/sdk-react';

const tonconnect = new TonConnect();

function AppContent() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const mainButton = useMainButton();
  const initData = useInitData();
  const launchParams = useLaunchParams();

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

    // Обработка параметра startapp
    if (launchParams.start_param) {
      console.log('App launched with start_param:', launchParams.start_param);
      // Здесь можно добавить логику обработки start_param
    }

    // Настройка MainButton
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
          // Добавьте другие необходимые поля
        }),
      });

      if (response.ok) {
        console.log('User successfully created');
        mainButton?.hide();
        // Здесь можно добавить логику после успешного создания пользователя
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