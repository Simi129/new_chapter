import React, { useState, useEffect, useCallback } from 'react';
import { 
  SDKProvider, 
  useInitData, 
  useMiniApp, 
  useBackButton,
  useThemeParams
} from '@telegram-apps/sdk-react';
import './styles/App.css';
import WalletInfo from './components/WalletInfo';
import QuestList from './components/QuestList';
import TonConnect from '@tonconnect/sdk';
import { createOrGetUser, updateUserWallet } from './api/userApi';

const tonconnect = new TonConnect({ manifestUrl: 'https://github.com/Simi129/new_chapter/tonconnect-manifest.json' });

function AppContent() {
  const [walletAddress, setWalletAddress] = useState('');
  const [tokenBalance, setTokenBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const initData = useInitData();
  const miniApp = useMiniApp();
  const backButton = useBackButton();
  const themeParams = useThemeParams();

  const handleInitUser = useCallback(async (initDataString) => {
    try {
      setIsLoading(true);
      const response = await createOrGetUser(initDataString);
      setUser(response.user);
      setTokenBalance(response.user.totalCoins || 0);
      setReferralCount(response.user.referralCount || 0);
      if (response.user.walletAddress) {
        setWalletAddress(response.user.walletAddress);
      }
      console.log('User created or fetched:', response.user);
    } catch (error) {
      console.error('Error initializing user:', error);
      setError('Failed to initialize user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initData && miniApp) {
      handleInitUser(initData);
    }
  }, [initData, miniApp, handleInitUser]);

  const connectWallet = useCallback(async () => {
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
        
        if (user) {
          await updateUserWallet(user.telegramId, walletInfo.address);
        }
        
        if (miniApp) {
          miniApp.sendData(JSON.stringify({ walletConnected: true, address: walletInfo.address }));
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError(`Failed to connect wallet: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [miniApp, user]);

  useEffect(() => {
    if (backButton) {
      backButton.show();
      const handleBackButtonClick = () => {
        console.log('Back button clicked');
        // Логика обработки нажатия кнопки "Назад"
      };
      backButton.on('click', handleBackButtonClick);
      return () => {
        backButton.off('click', handleBackButtonClick);
      };
    }
  }, [backButton]);

  useEffect(() => {
    if (themeParams) {
      console.log('Theme params:', themeParams);
      // Применение themeParams для стилизации приложения
      document.documentElement.style.setProperty('--tg-theme-bg-color', themeParams.bg_color);
      document.documentElement.style.setProperty('--tg-theme-text-color', themeParams.text_color);
    }
  }, [themeParams]);

  if (isLoading) {
    return <div className="loading">Loading... Please wait.</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      {user && <div className="welcome-message">Welcome, {user.username}!</div>}
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
        <button className="connect-wallet-button" onClick={connectWallet}>Подключить кошелек</button>
      )}
    </div>
  );
}

function App() {
  return (
    <SDKProvider acceptCustomStyles debug>
      <AppContent />
    </SDKProvider>
  );
}

export default App;