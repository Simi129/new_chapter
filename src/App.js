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
  const [isInTelegram, setIsInTelegram] = useState(false);

  useEffect(() => {
    console.log('App component mounted');
    checkEnvironment();
  }, []);

  useEffect(() => {
    if (tgWebApp) {
      // Пример использования tgWebApp для изменения цвета основной кнопки
      tgWebApp.setMainButtonColor('#FFCC00');
      tgWebApp.setMainButtonText('Готово');
      tgWebApp.showMainButton();
    }
  }, [tgWebApp]);

  const checkEnvironment = () => {
    if (window.Telegram && window.Telegram.WebApp) {
      console.log('Running inside Telegram WebApp');
      setIsInTelegram(true);
      setTgWebApp(window.Telegram.WebApp);
      window.Telegram.WebApp.ready();
    } else {
      console.log('Running in standalone mode');
      setIsInTelegram(false);
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
        if (tgWebApp) {
          // Отправляем данные обратно в бота при успешном подключении кошелька
          tgWebApp.sendData(JSON.stringify({ walletConnected: true, address: walletInfo.address }));
        }
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
        if (tgWebApp) {
          // Отправляем данные о создании пользователя обратно в бота
          tgWebApp.sendData(JSON.stringify({ userCreated: true, referralCount: data.referralCount }));
        }
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
      {isInTelegram ? (
        <div>Приложение запущено в Telegram</div>
      ) : (
        <div>Приложение запущено в автономном режиме</div>
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