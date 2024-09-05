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
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('App component mounted');

    const initializeTelegramWebApp = () => {
      console.log('Initializing Telegram WebApp');
      const tgWebApp = window.Telegram?.WebApp;
      if (tgWebApp) {
        console.log('Telegram WebApp found, calling ready()');
        tgWebApp.ready();
        setIsTelegramWebAppReady(true);
        console.log('Telegram WebApp initialized successfully');

        tgWebApp.MainButton.setText('Start');
        tgWebApp.MainButton.show();
        tgWebApp.MainButton.onClick(handleCreateUser);
        console.log('MainButton set up');
      } else {
        console.error('Telegram WebApp not found');
        setError('Telegram WebApp not available. Are you running this outside of Telegram?');
      }
    };

    const connectWallet = async () => {
      console.log('Connecting wallet');
      try {
        const { account } = await tonconnect.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 3600,
          messages: [],
        });
        setWalletAddress(account);
        console.log('Wallet connected:', account);
      } catch (error) {
        console.error('Error connecting wallet:', error);
        setError(`Failed to connect wallet: ${error.message}`);
      }
    };

    initializeTelegramWebApp();
    connectWallet();

    return () => {
      console.log('App component unmounting');
      const tgWebApp = window.Telegram?.WebApp;
      if (tgWebApp) {
        tgWebApp.MainButton.offClick(handleCreateUser);
      }
    };
  }, []);

  const handleCreateUser = async () => {
    console.log('handleCreateUser called');
    const tgWebApp = window.Telegram?.WebApp;
    if (!tgWebApp) {
      console.error('Telegram WebApp is not available');
      setError('Telegram WebApp is not available');
      return;
    }

    const initData = tgWebApp.initDataUnsafe;
    if (!initData || !initData.user) {
      console.error('User data is not available');
      setError('User data is not available');
      return;
    }

    try {
      console.log('Sending request to create user');
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
        setError('Failed to create user');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setError(`Failed to send request: ${error.message}`);
    }
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

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
        <div>Loading Telegram WebApp... Please wait.</div>
      )}
    </div>
  );
}

export default App;