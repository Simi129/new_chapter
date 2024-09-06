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
  const [tgWebApp, setTgWebApp] = useState(null);

  useEffect(() => {
    console.log('App component mounted');
    loadTelegramWebAppScript();
  }, []);

  const loadTelegramWebAppScript = () => {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    script.onload = () => {
      console.log('Telegram WebApp script loaded');
      initializeTelegramWebApp();
    };
    script.onerror = () => {
      console.error('Failed to load Telegram WebApp script');
      setIsLoading(false);
    };
    document.body.appendChild(script);
  };

  const initializeTelegramWebApp = () => {
    console.log('Initializing Telegram WebApp');
    if (window.Telegram && window.Telegram.WebApp) {
      console.log('Telegram WebApp found in window.Telegram.WebApp');
      setTgWebApp(window.Telegram.WebApp);
      window.Telegram.WebApp.ready();
      setIsLoading(false);
    } else {
      let attempts = 0;
      const maxAttempts = 10;
      const checkInterval = setInterval(() => {
        console.log(`Checking for Telegram WebApp (attempt ${attempts + 1})`);
        if (window.Telegram && window.Telegram.WebApp) {
          console.log('Telegram WebApp found after retry');
          clearInterval(checkInterval);
          setTgWebApp(window.Telegram.WebApp);
          window.Telegram.WebApp.ready();
          setIsLoading(false);
        } else if (++attempts >= maxAttempts) {
          console.warn("Telegram WebApp not found after multiple attempts. Make sure you're running this inside Telegram.");
          clearInterval(checkInterval);
          setIsLoading(false);
        }
      }, 500);
    }
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
      {tgWebApp ? (
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