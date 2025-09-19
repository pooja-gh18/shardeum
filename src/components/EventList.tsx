import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useContract } from '../hooks/useContract';
import { Event } from '../types';
import { formatDate, formatPrice, parsePrice, generateTicketMetadata } from '../utils/contract';

const EventList: React.FC = () => {
  const { contract, isConnected } = useContract();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (contract) {
      loadEvents();
    }
  }, [contract]);

  const loadEvents = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      const totalEvents = await contract.getTotalEvents();
      const eventsData: Event[] = [];

      for (let i = 1; i <= Number(totalEvents); i++) {
        try {
          const event = await contract.getEvent(i);
          eventsData.push({
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
          });
        } catch (error) {
          console.error(`Error loading event ${i}:`, error);
        }
      }

      setEvents(eventsData.filter(event => event.isActive));
    } catch (error) {
      console.error('Error loading events:', error);
      setMessage('Error loading events');
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseTicket = async (eventId: number, eventName: string) => {
    if (!contract || !isConnected) {
      setMessage('Please connect your wallet first');
      return;
    }

    try {
      setPurchaseLoading(eventId);
      setMessage('');

      const event = events.find(e => e.id === eventId);
      if (!event) {
        setMessage('Event not found');
        return;
      }

      // Generate ticket metadata
      const ticketMetadata = generateTicketMetadata(eventName, Date.now(), eventId);
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(ticketMetadata))}`;

      const tx = await contract.purchaseTicket(eventId, metadataURI, {
        value: event.ticketPrice,
      });

      await tx.wait();
      setMessage('Ticket purchased successfully!');
      
      // Reload events to update sold tickets count
      await loadEvents();

    } catch (error: any) {
      console.error('Error purchasing ticket:', error);
      setMessage(`Error: ${error.message || 'Failed to purchase ticket'}`);
    } finally {
      setPurchaseLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2">Loading events...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Available Events</h2>
        <button 
          onClick={loadEvents}
          className="btn-secondary"
          disabled={isLoading}
        >
          Refresh
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {events.length === 0 ? (
        <div className="card text-center">
          <p className="text-gray-600">No events available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isEventPassed = Date.now() / 1000 > event.eventDate;
            const isSoldOut = event.soldTickets >= event.maxTickets;
            const canPurchase = !isEventPassed && !isSoldOut && isConnected;

            return (
              <div key={event.id} className="card hover:shadow-lg transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {event.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <span className="font-medium">📍 Venue:</span>
                    <span className="ml-1">{event.venue}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">📅 Date:</span>
                    <span className="ml-1">{formatDate(event.eventDate)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">💰 Price:</span>
                    <span className="ml-1">{formatPrice(event.ticketPrice)} ETH</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium">🎫 Tickets:</span>
                    <span className="ml-1">
                      {event.soldTickets}/{event.maxTickets} sold
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  {isEventPassed ? (
                    <button className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
                      Event Passed
                    </button>
                  ) : isSoldOut ? (
                    <button className="w-full py-2 px-4 bg-red-300 text-red-700 rounded-lg cursor-not-allowed">
                      Sold Out
                    </button>
                  ) : !isConnected ? (
                    <button className="w-full py-2 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
                      Connect Wallet to Purchase
                    </button>
                  ) : (
                    <button
                      onClick={() => purchaseTicket(event.id, event.name)}
                      disabled={purchaseLoading === event.id}
                      className={`w-full btn-primary ${purchaseLoading === event.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {purchaseLoading === event.id ? 'Purchasing...' : 'Buy Ticket'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventList;