import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useContract } from '../hooks/useContract';
import { EventFormData } from '../types';
import { parsePrice } from '../utils/contract';

const CreateEvent: React.FC = () => {
  const { contract, isConnected } = useContract();
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    description: '',
    venue: '',
    eventDate: '',
    ticketPrice: '',
    maxTickets: '',
    imageUrl: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !contract) {
      setMessage('Please connect your wallet first');
      return;
    }

    try {
      setIsLoading(true);
      setMessage('');

      const eventDateTimestamp = Math.floor(new Date(formData.eventDate).getTime() / 1000);
      const ticketPriceWei = parsePrice(formData.ticketPrice);
      
      // Create metadata URI (in a real app, this would be uploaded to IPFS)
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify({
        name: formData.name,
        description: formData.description,
        image: formData.imageUrl || 'https://via.placeholder.com/400x600/3b82f6/ffffff?text=Event',
        attributes: [
          { trait_type: 'Venue', value: formData.venue },
          { trait_type: 'Date', value: formData.eventDate },
          { trait_type: 'Max Tickets', value: formData.maxTickets },
        ]
      }))}`;

      const tx = await contract.createEvent(
        formData.name,
        formData.description,
        formData.venue,
        eventDateTimestamp,
        ticketPriceWei,
        parseInt(formData.maxTickets),
        metadataURI
      );

      await tx.wait();
      setMessage('Event created successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        venue: '',
        eventDate: '',
        ticketPrice: '',
        maxTickets: '',
        imageUrl: '',
      });

    } catch (error: any) {
      console.error('Error creating event:', error);
      setMessage(`Error: ${error.message || 'Failed to create event'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-4">Create Event</h2>
          <p className="text-gray-600">Please connect your wallet to create an event.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card">
        <h2 className="text-2xl font-bold mb-6">Create New Event</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Event Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="input-field"
              placeholder="Enter event name"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={3}
              className="input-field"
              placeholder="Describe your event"
            />
          </div>

          <div>
            <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
              Venue *
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleInputChange}
              required
              className="input-field"
              placeholder="Event venue"
            />
          </div>

          <div>
            <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
              Event Date & Time *
            </label>
            <input
              type="datetime-local"
              id="eventDate"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              required
              className="input-field"
              min={new Date().toISOString().slice(0, 16)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ticketPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Price (ETH) *
              </label>
              <input
                type="number"
                id="ticketPrice"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleInputChange}
                required
                step="0.001"
                min="0"
                className="input-field"
                placeholder="0.01"
              />
            </div>

            <div>
              <label htmlFor="maxTickets" className="block text-sm font-medium text-gray-700 mb-1">
                Max Tickets *
              </label>
              <input
                type="number"
                id="maxTickets"
                name="maxTickets"
                value={formData.maxTickets}
                onChange={handleInputChange}
                required
                min="1"
                className="input-field"
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Event Image URL
            </label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-md ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full btn-primary ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Creating Event...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;