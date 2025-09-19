// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract EventTicketNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _eventIdCounter;
    
    struct Event {
        uint256 id;
        string name;
        string description;
        string venue;
        uint256 eventDate;
        uint256 ticketPrice;
        uint256 maxTickets;
        uint256 soldTickets;
        address organizer;
        bool isActive;
        string metadataURI;
    }
    
    struct Ticket {
        uint256 tokenId;
        uint256 eventId;
        address owner;
        bool isUsed;
        uint256 purchaseDate;
    }
    
    mapping(uint256 => Event) public events;
    mapping(uint256 => Ticket) public tickets;
    mapping(uint256 => uint256[]) public eventTickets; // eventId => tokenIds[]
    mapping(address => uint256[]) public userTickets; // user => tokenIds[]
    
    event EventCreated(uint256 indexed eventId, string name, address indexed organizer, uint256 ticketPrice, uint256 maxTickets);
    event TicketPurchased(uint256 indexed tokenId, uint256 indexed eventId, address indexed buyer, uint256 price);
    event TicketUsed(uint256 indexed tokenId, uint256 indexed eventId);
    event EventDeactivated(uint256 indexed eventId);
    
    constructor() ERC721("Event Ticket NFT", "ETNFT") {}
    
    function createEvent(
        string memory _name,
        string memory _description,
        string memory _venue,
        uint256 _eventDate,
        uint256 _ticketPrice,
        uint256 _maxTickets,
        string memory _metadataURI
    ) public returns (uint256) {
        require(_eventDate > block.timestamp, "Event date must be in the future");
        require(_maxTickets > 0, "Max tickets must be greater than 0");
        require(bytes(_name).length > 0, "Event name cannot be empty");
        
        _eventIdCounter.increment();
        uint256 eventId = _eventIdCounter.current();
        
        events[eventId] = Event({
            id: eventId,
            name: _name,
            description: _description,
            venue: _venue,
            eventDate: _eventDate,
            ticketPrice: _ticketPrice,
            maxTickets: _maxTickets,
            soldTickets: 0,
            organizer: msg.sender,
            isActive: true,
            metadataURI: _metadataURI
        });
        
        emit EventCreated(eventId, _name, msg.sender, _ticketPrice, _maxTickets);
        return eventId;
    }
    
    function purchaseTicket(uint256 _eventId, string memory _tokenURI) public payable nonReentrant {
        Event storage event_ = events[_eventId];
        require(event_.isActive, "Event is not active");
        require(event_.soldTickets < event_.maxTickets, "Event is sold out");
        require(msg.value >= event_.ticketPrice, "Insufficient payment");
        require(block.timestamp < event_.eventDate, "Event has already passed");
        
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        
        tickets[tokenId] = Ticket({
            tokenId: tokenId,
            eventId: _eventId,
            owner: msg.sender,
            isUsed: false,
            purchaseDate: block.timestamp
        });
        
        eventTickets[_eventId].push(tokenId);
        userTickets[msg.sender].push(tokenId);
        event_.soldTickets++;
        
        // Transfer payment to event organizer
        if (msg.value > 0) {
            payable(event_.organizer).transfer(msg.value);
        }
        
        emit TicketPurchased(tokenId, _eventId, msg.sender, msg.value);
    }
    
    function useTicket(uint256 _tokenId) public {
        require(_exists(_tokenId), "Ticket does not exist");
        Ticket storage ticket = tickets[_tokenId];
        Event memory event_ = events[ticket.eventId];
        
        require(msg.sender == event_.organizer, "Only event organizer can mark tickets as used");
        require(!ticket.isUsed, "Ticket has already been used");
        require(block.timestamp >= event_.eventDate - 3600, "Too early to use ticket"); // 1 hour before event
        
        ticket.isUsed = true;
        emit TicketUsed(_tokenId, ticket.eventId);
    }
    
    function deactivateEvent(uint256 _eventId) public {
        Event storage event_ = events[_eventId];
        require(msg.sender == event_.organizer, "Only organizer can deactivate event");
        require(event_.isActive, "Event is already inactive");
        
        event_.isActive = false;
        emit EventDeactivated(_eventId);
    }
    
    function getEvent(uint256 _eventId) public view returns (Event memory) {
        return events[_eventId];
    }
    
    function getTicket(uint256 _tokenId) public view returns (Ticket memory) {
        return tickets[_tokenId];
    }
    
    function getEventTickets(uint256 _eventId) public view returns (uint256[] memory) {
        return eventTickets[_eventId];
    }
    
    function getUserTickets(address _user) public view returns (uint256[] memory) {
        return userTickets[_user];
    }
    
    function getTotalEvents() public view returns (uint256) {
        return _eventIdCounter.current();
    }
    
    function getTotalTickets() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    function isTicketValid(uint256 _tokenId) public view returns (bool) {
        if (!_exists(_tokenId)) return false;
        
        Ticket memory ticket = tickets[_tokenId];
        Event memory event_ = events[ticket.eventId];
        
        return event_.isActive && !ticket.isUsed && block.timestamp < event_.eventDate;
    }
    
    // Override required functions
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}