import React from 'react';
import { useContract } from '../hooks/useContract';
import { truncateAddress } from '../utils/contract';

const Header: React.FC = () => {
  const { account, isConnected, connectWallet, disconnectWallet } = useContract();

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">
              🎫 NFT Event Ticketing
            </h1>
            <span className="ml-2 text-sm text-gray-500">on Shardeum</span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <a href="#events" className="text-gray-600 hover:text-primary-600 transition-colors">
              Events
            </a>
            <a href="#create" className="text-gray-600 hover:text-primary-600 transition-colors">
              Create Event
            </a>
            <a href="#my-tickets" className="text-gray-600 hover:text-primary-600 transition-colors">
              My Tickets
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm">
                  <span className="text-gray-600">Connected:</span>
                  <span className="ml-1 font-medium text-primary-600">
                    {truncateAddress(account)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;