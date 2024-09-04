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

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const { account } = await tonconnect.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 3600,
          messages: [],
        });

        setWalletAddress(account);

        // Get wallet balance (example)
        const balance = await getWalletBalance(account);
        setTokenBalance(balance);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    };

    connectWallet();

    // Get referral count (example)
    const getReferralCount = async () => {
      return 3; // Example
    };

    getReferralCount().then(count => setReferralCount(count));
  }, []);

  // Example function to get balance (replace with real implementation)
  const getWalletBalance = async (address) => {
    return 100; // Example
  };

  return (
    <div className="app-container">
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
    </div>
  );
}

export default App;