export interface Event {
  id: number;
  name: string;
  description: string;
  venue: string;
  eventDate: number;
  ticketPrice: string;
  maxTickets: number;
  soldTickets: number;
  organizer: string;
  isActive: boolean;
  metadataURI: string;
}

export interface Ticket {
  tokenId: number;
  eventId: number;
  owner: string;
  isUsed: boolean;
  purchaseDate: number;
}

export interface EventFormData {
  name: string;
  description: string;
  venue: string;
  eventDate: string;
  ticketPrice: string;
  maxTickets: string;
  imageUrl: string;
}