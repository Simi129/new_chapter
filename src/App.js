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

        tgWebApp.MainButton.setText('Connect Wallet');
        tgWebApp.MainButton.show();
        tgWebApp.MainButton.onClick(connectWallet);
        console.log('MainButton set up');
      } else {
        console.error('Telegram WebApp not found');
        setError('Telegram WebApp not available. Are you running this outside of Telegram?');
      }
    };

    const connectWallet = async () => {
      console.log('Connecting wallet');
      try {
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
      }
    };

    initializeTelegramWebApp();

    return () => {
      console.log('App component unmounting');
      const tgWebApp = window.Telegram?.WebApp;
      if (tgWebApp) {
        tgWebApp.MainButton.offClick(connectWallet);
      }
    };
  }, []);

  const handleCreateUser = async () => {
    try {
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
            <WalletInfo address={walletAddress} balance={tokenBalance} />
          </div>
          <QuestList />
          <div className="referral-info">
            Приглашено рефералов: {referralCount}
          </div>
          <button onClick={handleCreateUser}>Create User</button>
        </>
      ) : (
        <div>Loading Telegram WebApp... Please wait.</div>
      )}
    </div>
  );
}

export default App;