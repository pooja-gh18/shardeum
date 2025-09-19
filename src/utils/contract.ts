import { ethers } from 'ethers';

// Contract address will be set after deployment
// For development, you can set this manually after deploying the contract
export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // Replace with actual deployed address

export const CONTRACT_ABI = [
  // Event creation
  "function createEvent(string memory _name, string memory _description, string memory _venue, uint256 _eventDate, uint256 _ticketPrice, uint256 _maxTickets, string memory _metadataURI) public returns (uint256)",
  
  // Ticket purchasing
  "function purchaseTicket(uint256 _eventId, string memory _tokenURI) public payable",
  
  // Ticket usage
  "function useTicket(uint256 _tokenId) public",
  
  // View functions
  "function getEvent(uint256 _eventId) public view returns (tuple(uint256 id, string name, string description, string venue, uint256 eventDate, uint256 ticketPrice, uint256 maxTickets, uint256 soldTickets, address organizer, bool isActive, string metadataURI))",
  "function getTicket(uint256 _tokenId) public view returns (tuple(uint256 tokenId, uint256 eventId, address owner, bool isUsed, uint256 purchaseDate))",
  "function getUserTickets(address _user) public view returns (uint256[])",
  "function getEventTickets(uint256 _eventId) public view returns (uint256[])",
  "function getTotalEvents() public view returns (uint256)",
  "function isTicketValid(uint256 _tokenId) public view returns (bool)",
  
  // Events
  "event EventCreated(uint256 indexed eventId, string name, address indexed organizer, uint256 ticketPrice, uint256 maxTickets)",
  "event TicketPurchased(uint256 indexed tokenId, uint256 indexed eventId, address indexed buyer, uint256 price)",
  "event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId)"
];

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString();
};

export const formatPrice = (price: string): string => {
  return ethers.formatEther(price);
};

export const parsePrice = (price: string): bigint => {
  return ethers.parseEther(price);
};

export const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const generateTicketMetadata = (eventName: string, tokenId: number, eventId: number) => {
  return {
    name: `${eventName} - Ticket #${tokenId}`,
    description: `NFT Ticket for ${eventName}`,
    image: `https://via.placeholder.com/400x600/3b82f6/ffffff?text=Ticket+${tokenId}`,
    attributes: [
      {
        trait_type: "Event ID",
        value: eventId
      },
      {
        trait_type: "Ticket ID",
        value: tokenId
      },
      {
        trait_type: "Event Name",
        value: eventName
      }
    ]
  };
};