import React, { useState, useEffect } from 'react';
import { 
  SDKProvider, 
  useInitData, 
  useMainButton, 
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
  const mainButton = useMainButton();
  const miniApp = useMiniApp();
  const backButton = useBackButton();
  const themeParams = useThemeParams();

  useEffect(() => {
    if (initData) {
      console.log('Init data:', initData);
    }
  }, [initData]);

  useEffect(() => {
    if (mainButton) {
      mainButton.setText('Подключить кошелек');
      mainButton.show();
      mainButton.onClick(connectWallet);
    }
  }, [mainButton]);

  useEffect(() => {
    if (miniApp) {
      miniApp.ready();
    }
  }, [miniApp]);

  useEffect(() => {
    if (backButton) {
      backButton.show();
      backButton.onClick(() => {
        console.log('Back button clicked');
        // Добавьте здесь логику для обработки нажатия кнопки "Назад"
      });
    }
  }, [backButton]);

  useEffect(() => {
    if (themeParams) {
      console.log('Theme params:', themeParams);
      // Здесь вы можете использовать themeParams для стилизации вашего приложения
    }
  }, [themeParams]);

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
        if (miniApp) {
          // Отправляем данные обратно в бота при успешном подключении кошелька
          miniApp.sendData(JSON.stringify({ walletConnected: true, address: walletInfo.address }));
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

const handleCreateUser = async () => {
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
        // Отправляем данные о создании пользователя обратно в бота
        miniApp.sendData(JSON.stringify({ userCreated: true, referralCount: data.referralCount }));
      }
    }
  } catch (error) {
    console.error('Error creating user:', error);
    setError('Failed to create user: ' + error.message);
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