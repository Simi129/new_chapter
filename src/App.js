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

  const initData = useInitData();
  const miniApp = useMiniApp();
  const backButton = useBackButton();
  const themeParams = useThemeParams();

  useEffect(() => {
    console.log('App mounted, checking initialization...');
    if (initData) {
      console.log('Init data received:', initData);
    } else {
      console.log('Init data not available yet');
    }
    if (miniApp) {
      console.log('MiniApp is available');
      miniApp.ready();
    } else {
      console.log('MiniApp is not available yet');
    }
    setIsLoading(false);
  }, [initData, miniApp]);

  useEffect(() => {
    if (backButton) {
      console.log('Back button is available');
      backButton.show();
      const handleBackButtonClick = () => {
        console.log('Back button clicked');
      };
      backButton.on('click', handleBackButtonClick);
      return () => {
        backButton.off('click', handleBackButtonClick);
      };
    } else {
      console.log('Back button is not available');
    }
  }, [backButton]);

  useEffect(() => {
    if (themeParams) {
      console.log('Theme params received:', themeParams);
    } else {
      console.log('Theme params not available yet');
    }
  }, [themeParams]);

  const connectWallet = useCallback(async () => {
    console.log('Attempting to connect wallet...');
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
    console.log('Updating token balance for address:', address);
    try {
      const response = await fetch(`/api/balance/${address}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTokenBalance(data.balance);
      console.log('Token balance updated:', data.balance);
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setError('Failed to fetch token balance');
    }
  };

  const handleCreateUser = useCallback(async () => {
    console.log('Attempting to create user...');
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
        console.log('User created, referral count:', data.referralCount);
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