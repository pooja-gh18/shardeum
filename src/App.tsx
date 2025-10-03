import React, { useState } from 'react';
import Header from './components/Header';
import EventList from './components/EventList';
import CreateEvent from './components/CreateEvent';
import MyTickets from './components/MyTickets';
import './styles/globals.css';

type TabType = 'events' | 'create' | 'my-tickets';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('events');

  const renderContent = () => {
    switch (activeTab) {
      case 'events':
        return <EventList />;
      case 'create':
        return <CreateEvent />;
      case 'my-tickets':
        return <MyTickets />;
      default:
        return <EventList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'events'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Browse Events
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'create'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Create Event
            </button>
            <button
              onClick={() => setActiveTab('my-tickets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'my-tickets'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Tickets
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-8">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>NFT Event Ticketing System built on Shardeum</p>
            <p className="mt-1">Secure, transparent, and decentralized event management</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;