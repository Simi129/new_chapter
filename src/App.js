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

  useEffect(() => {
    if (initData && miniApp) {
      createOrGetUser(initData);
    }
  }, [initData, miniApp]);

  const createOrGetUser = async (initData) => {
    try {
      const response = await fetch('/api/users/create-or-get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId: initData.user.id.toString(),
          username: initData.user.username
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUser(data.user);
      console.log('User created or fetched:', data.user);
    } catch (error) {
      console.error('Error creating or fetching user:', error);
      setError('Failed to initialize user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (backButton) {
      backButton.show();
      const handleBackButtonClick = () => {
        console.log('Back button clicked');
        // Добавьте здесь логику для обработки нажатия кнопки "Назад"
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
      // Здесь вы можете использовать themeParams для стилизации вашего приложения
    }
  }, [themeParams]);

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
        await updateTokenBalance(walletInfo.address);
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
  }, [miniApp]);

  const updateTokenBalance = async (address) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/balance/${address}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTokenBalance(data.balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setError('Failed to fetch token balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!walletAddress) {
        throw new Error('Wallet address is not set');
      }
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: walletAddress }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.referralCount) {
        setReferralCount(data.referralCount);
        if (miniApp) {
          miniApp.sendData(JSON.stringify({ userCreated: true, referralCount: data.referralCount }));
        }
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress, miniApp]);

  if (isLoading) {
    return <div>Loading... Please wait.</div>;
  }

  if (error) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="app-container">
      {user && <div>Welcome, {user.username}!</div>}
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

function App() {
  return (
    <SDKProvider acceptCustomStyles debug>
      <AppContent />
    </SDKProvider>
  );
}

export default App;