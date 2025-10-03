# NFT Event Ticketing System

A decentralized event ticketing platform built on Shardeum blockchain using NFTs to represent event tickets. This application provides a transparent, secure, and fraud-proof way to manage event tickets.

## 🌟 Features

- **Create Events**: Event organizers can create events with details like venue, date, ticket price, and maximum capacity
- **Purchase NFT Tickets**: Users can buy tickets that are minted as NFTs on the blockchain
- **Ticket Validation**: Smart contract-based ticket validation system
- **My Tickets Dashboard**: Users can view all their purchased tickets
- **Secure Payments**: Direct payments to event organizers through smart contracts
- **Anti-fraud**: NFT-based tickets prevent counterfeiting and double-spending

## 🛠 Technology Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Smart Contracts**: Solidity with OpenZeppelin libraries
- **Blockchain**: Shardeum (EVM-compatible)
- **Web3 Integration**: ethers.js
- **Development**: Hardhat, Vite
- **Testing**: Jest, Hardhat testing framework

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet
- Shardeum testnet tokens (for testing)

## 🚀 Getting Started

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd shardeum
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Compile Smart Contracts

```bash
npm run compile
```

### 4. Deploy Contracts

For local development:
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npm run deploy
```

For Shardeum testnet:
```bash
npm run deploy -- --network shardeum
```

### 5. Start Frontend

```bash
npm run dev
```

Visit `http://localhost:5173` to access the application.

## 🧪 Testing

### Run Smart Contract Tests

```bash
npm run test:contracts
```

### Run Frontend Tests

```bash
npm test
```

## 📱 Usage

### For Event Organizers

1. **Connect Wallet**: Connect your MetaMask wallet to the application
2. **Create Event**: 
   - Navigate to "Create Event" tab
   - Fill in event details (name, description, venue, date, price, max tickets)
   - Submit the form and confirm the transaction
3. **Manage Events**: View your created events and ticket sales

### For Ticket Buyers

1. **Connect Wallet**: Connect your MetaMask wallet
2. **Browse Events**: View available events on the main page
3. **Purchase Tickets**: 
   - Click "Buy Ticket" on desired event
   - Confirm the transaction in your wallet
4. **View Tickets**: Check your purchased tickets in "My Tickets" tab

### For Event Entry

1. Event organizers can mark tickets as "used" during event entry
2. The system prevents double-spending and validates ticket ownership

## 📄 Smart Contract Details

### EventTicketNFT Contract

**Main Functions:**

- `createEvent()`: Create a new event
- `purchaseTicket()`: Buy a ticket NFT for an event
- `useTicket()`: Mark a ticket as used (organizer only)
- `getEvent()`: Get event details
- `getUserTickets()`: Get all tickets owned by a user
- `isTicketValid()`: Check if a ticket is valid and unused

**Events Emitted:**

- `EventCreated`: When a new event is created
- `TicketPurchased`: When a ticket is purchased
- `TicketUsed`: When a ticket is marked as used

## 🔧 Configuration

### Hardhat Networks

The project supports multiple networks:

- **Hardhat**: Local development network
- **Localhost**: Local Hardhat node
- **Shardeum**: Shardeum testnet

### Contract Addresses

After deployment, contract addresses are saved in `src/contract-address.json` and automatically used by the frontend.

## 🛡 Security Features

- **Reentrancy Protection**: Smart contracts use OpenZeppelin's ReentrancyGuard
- **Access Control**: Only event organizers can mark tickets as used
- **Time-based Validation**: Tickets can only be purchased before event date
- **Payment Security**: Direct transfer to event organizers

## 📈 Future Enhancements

- IPFS integration for metadata storage
- QR code generation for easy ticket validation
- Mobile app development
- Secondary ticket marketplace
- Integration with additional payment methods
- Advanced analytics for event organizers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Join our community discussions

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Shardeum for the blockchain infrastructure
- React and Vite teams for excellent development tools