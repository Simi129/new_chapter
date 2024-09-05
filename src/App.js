import React, { useState, useEffect } from 'react';
import './styles/App.css';
import WalletInfo from './components/WalletInfo';
import QuestList from './components/QuestList';
import TonConnect from '@tonconnect/sdk';

const tonconnect = new TonConnect({ manifestUrl: 'https://github.com/Simi129/new_chapter/tonconnect-manifest.json' });

function App() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tgWebAppReady, setTgWebAppReady] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    initializeTelegramWebApp();
  }, []);

  const initializeTelegramWebApp = () => {
  console.log('Initializing Telegram WebApp');
  const tgWebApp = window.Telegram?.WebApp;
  if (tgWebApp) {
    console.log('Telegram WebApp found, calling ready()');
    try {
      tgWebApp.ready();
      setTgWebAppReady(true);
      console.log('Telegram WebApp initialized successfully');
    } catch (error) {
      console.error('Error initializing Telegram WebApp:', error);
      setError('Failed to initialize Telegram WebApp');
    }
  } else {
    console.warn(`Telegram WebApp not found. Make sure you're running this inside Telegram.`);
  }
  setIsLoading(false);
};

  const connectWallet = async () => {
    console.log('Connecting wallet');
    try {
      setIsLoading(true);
      const walletConnectionSource = {
        jsBridgeKey: 'tonkeeper',
        universalLink: 'https://app.tonkeeper.com/ton-connect',
      };
      
      await tonconnect.connect(walletConnectionSource);
      
      const walletInfo = await tonconnect.getWalletInfo();
      if (walletInfo) {
        setWalletAddress(walletInfo.address);
        console.log('Wallet connected:', walletInfo.address);
        await updateTokenBalance(walletInfo.address);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTokenBalance = async (address) => {
    try {
      // Здесь должен быть запрос к вашему API для получения баланса
      const response = await fetch(`/api/balance/${address}`);
      const data = await response.json();
      setTokenBalance(data.balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setError('Failed to fetch token balance');
    }
  };

  const handleCreateUser = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: walletAddress }),
      });
      const data = await response.json();
      if (data.referralCount) {
        setReferralCount(data.referralCount);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="app-container">
      {tgWebAppReady ? (
        <div>Telegram WebApp is ready</div>
      ) : (
        <div>Running in standalone mode</div>
      )}
      <div className="total-balance">
        <span className="balance-value">{tokenBalance}</span>
        <span className="balance-currency">TON</span>
      </div>
      <img className="app-image" src="ball1.png" alt="App Logo" />
      <div className="wallet-info-container">
        <WalletInfo address={walletAddress} balance={tokenBalance} />
      </div>
      <QuestList />
      <div className="referral-info">
        Приглашено рефералов: {referralCount}
      </div>
      {!walletAddress && (
        <button onClick={connectWallet}>Подключить кошелек</button>
      )}
      {walletAddress && (
        <button onClick={handleCreateUser}>Create User</button>
      )}
    </div>
  );
}

export default App;