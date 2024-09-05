import React, { useState, useEffect } from 'react';
import './styles/App.css';
import WalletInfo from './components/WalletInfo';
import QuestList from './components/QuestList';
import TonConnect from '@tonconnect/sdk';

const tonconnect = new TonConnect();

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [isTelegramWebAppReady, setIsTelegramWebAppReady] = useState(false);

  useEffect(() => {
    const tgWebApp = window.Telegram?.WebApp;
    if (tgWebApp) {
      tgWebApp.ready();
      setIsTelegramWebAppReady(true);
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

    if (tgWebApp) {
      tgWebApp.MainButton.setText('Start');
      tgWebApp.MainButton.show();
      tgWebApp.MainButton.onClick(handleCreateUser);
    }

    return () => {
      if (tgWebApp) {
        tgWebApp.MainButton.offClick(handleCreateUser);
      }
    };
  }, []);

  const handleCreateUser = async () => {
    const tgWebApp = window.Telegram?.WebApp;
    if (!tgWebApp) {
      console.error('Telegram WebApp is not available');
      return;
    }

    const initData = tgWebApp.initDataUnsafe;
    if (!initData || !initData.user) {
      console.error('User data is not available');
      return;
    }

    try {
      const response = await fetch('YOUR_API_ENDPOINT/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: initData.user.id,
          username: initData.user.username,
          walletAddress: walletAddress,
        }),
      });

      if (response.ok) {
        console.log('User successfully created');
        tgWebApp.MainButton.hide();
      } else {
        console.error('Error creating user');
      }
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  return (
    <div className="app-container">
      {isTelegramWebAppReady ? (
        <>
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
        </>
      ) : (
        <div>Loading Telegram WebApp...</div>
      )}
    </div>
  );
}

export default App;