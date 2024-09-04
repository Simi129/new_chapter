import React from 'react';
import '../styles/WalletInfo.css';

function WalletInfo({ address, balance }) {
  const shortAddress = address ? address.slice(0, 6) + '...' + address.slice(-4) : 'Connecting...';

  return (
    <div className="wallet-info">
      <span>Wallet:</span>
      <span className="wallet-address">{shortAddress}</span>
      <span>{balance} TON</span>
    </div>
  );
}

export default WalletInfo;