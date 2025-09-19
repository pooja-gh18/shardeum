import React, { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { Ticket, Event } from '../types';
import { formatDate, formatPrice } from '../utils/contract';

const MyTickets: React.FC = () => {
  const { contract, account, isConnected } = useContract();
  const [tickets, setTickets] = useState<(Ticket & { event: Event })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (contract && account) {
      loadUserTickets();
    }
  }, [contract, account]);

  const loadUserTickets = async () => {
    if (!contract || !account) return;

    try {
      setIsLoading(true);
      const userTicketIds = await contract.getUserTickets(account);
      const ticketsData: (Ticket & { event: Event })[] = [];

      for (const tokenId of userTicketIds) {
        try {
          const ticket = await contract.getTicket(Number(tokenId));
          const event = await contract.getEvent(Number(ticket.eventId));
          
          ticketsData.push({
            tokenId: Number(ticket.tokenId),
            eventId: Number(ticket.eventId),
            owner: ticket.owner,
            isUsed: ticket.isUsed,
            purchaseDate: Number(ticket.purchaseDate),
            event: {
              id: Number(event.id),
              name: event.name,
              description: event.description,
              venue: event.venue,
              eventDate: Number(event.eventDate),
              ticketPrice: event.ticketPrice.toString(),
              maxTickets: Number(event.maxTickets),
              soldTickets: Number(event.soldTickets),
              organizer: event.organizer,
              isActive: event.isActive,
              metadataURI: event.metadataURI,
            },
          });
        } catch (error) {
          console.error(`Error loading ticket ${tokenId}:`, error);
        }
      }

      setTickets(ticketsData);
    } catch (error) {
      console.error('Error loading user tickets:', error);
      setMessage('Error loading your tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const getTicketStatus = (ticket: Ticket & { event: Event }) => {
    if (ticket.isUsed) {
      return { status: 'Used', className: 'bg-gray-100 text-gray-600' };
    }
    
    const now = Date.now() / 1000;
    const eventDate = ticket.event.eventDate;
    
    if (now > eventDate) {
      return { status: 'Expired', className: 'bg-red-100 text-red-600' };
    }
    
    if (now > eventDate - 3600) { // 1 hour before event
      return { status: 'Ready to Use', className: 'bg-green-100 text-green-600' };
    }
    
    return { status: 'Valid', className: 'bg-blue-100 text-blue-600' };
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">My Tickets</h2>
          <p className="text-gray-600">Please connect your wallet to view your tickets.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2">Loading your tickets...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">My Tickets</h2>
        <button 
          onClick={loadUserTickets}
          className="btn-secondary"
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700">
          {message}
        </div>
      )}

      {tickets.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-600">You don't have any tickets yet.</p>
          <p className="text-sm text-gray-500 mt-2">
            Browse events and purchase tickets to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const ticketStatus = getTicketStatus(ticket);
            
            return (
              <div key={ticket.tokenId} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {ticket.event.name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${ticketStatus.className}`}>
                        {ticketStatus.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium">🎫 Ticket ID:</span>
                          <span className="ml-1">#{ticket.tokenId}</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium">📍 Venue:</span>
                          <span className="ml-1">{ticket.event.venue}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">📅 Event Date:</span>
                          <span className="ml-1">{formatDate(ticket.event.eventDate)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium">💰 Paid:</span>
                          <span className="ml-1">{formatPrice(ticket.event.ticketPrice)} ETH</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <span className="font-medium">🛒 Purchased:</span>
                          <span className="ml-1">{formatDate(ticket.purchaseDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium">✅ Status:</span>
                          <span className="ml-1">
                            {ticket.isUsed ? 'Used' : 'Unused'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {ticket.event.description && (
                      <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                        {ticket.event.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <div className="text-2xl mb-2">🎫</div>
                      <div className="text-xs text-gray-500">NFT Ticket</div>
                      <div className="text-sm font-medium">#{ticket.tokenId}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTickets;