const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EventTicketNFT", function () {
  let eventTicketNFT;
  let owner;
  let organizer;
  let buyer;
  let addrs;

  beforeEach(async function () {
    [owner, organizer, buyer, ...addrs] = await ethers.getSigners();

    const EventTicketNFT = await ethers.getContractFactory("EventTicketNFT");
    eventTicketNFT = await EventTicketNFT.deploy();
    await eventTicketNFT.waitForDeployment();
  });

  describe("Event Creation", function () {
    it("Should create an event successfully", async function () {
      const eventDate = Math.floor(Date.now() / 1000) + 86400; // 1 day from now
      const ticketPrice = ethers.parseEther("0.1");
      const maxTickets = 100;

      await expect(
        eventTicketNFT.connect(organizer).createEvent(
          "Test Event",
          "A test event",
          "Test Venue",
          eventDate,
          ticketPrice,
          maxTickets,
          "metadata-uri"
        )
      ).to.emit(eventTicketNFT, "EventCreated");

      const event = await eventTicketNFT.getEvent(1);
      expect(event.name).to.equal("Test Event");
      expect(event.organizer).to.equal(organizer.address);
      expect(event.ticketPrice).to.equal(ticketPrice);
    });

    it("Should fail to create event with past date", async function () {
      const pastDate = Math.floor(Date.now() / 1000) - 86400; // 1 day ago
      const ticketPrice = ethers.parseEther("0.1");

      await expect(
        eventTicketNFT.connect(organizer).createEvent(
          "Test Event",
          "A test event",
          "Test Venue",
          pastDate,
          ticketPrice,
          100,
          "metadata-uri"
        )
      ).to.be.revertedWith("Event date must be in the future");
    });
  });

  describe("Ticket Purchasing", function () {
    let eventId;
    const ticketPrice = ethers.parseEther("0.1");

    beforeEach(async function () {
      const eventDate = Math.floor(Date.now() / 1000) + 86400;
      
      await eventTicketNFT.connect(organizer).createEvent(
        "Test Event",
        "A test event",
        "Test Venue",
        eventDate,
        ticketPrice,
        100,
        "metadata-uri"
      );
      eventId = 1;
    });

    it("Should purchase ticket successfully", async function () {
      await expect(
        eventTicketNFT.connect(buyer).purchaseTicket(eventId, "ticket-uri", {
          value: ticketPrice,
        })
      ).to.emit(eventTicketNFT, "TicketPurchased");

      const ticket = await eventTicketNFT.getTicket(1);
      expect(ticket.eventId).to.equal(eventId);
      expect(ticket.owner).to.equal(buyer.address);
      expect(ticket.isUsed).to.be.false;
    });

    it("Should fail with insufficient payment", async function () {
      const insufficientPayment = ethers.parseEther("0.05");

      await expect(
        eventTicketNFT.connect(buyer).purchaseTicket(eventId, "ticket-uri", {
          value: insufficientPayment,
        })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("Should transfer payment to organizer", async function () {
      const initialBalance = await ethers.provider.getBalance(organizer.address);

      await eventTicketNFT.connect(buyer).purchaseTicket(eventId, "ticket-uri", {
        value: ticketPrice,
      });

      const finalBalance = await ethers.provider.getBalance(organizer.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });
  });

  describe("Ticket Usage", function () {
    let eventId;
    let tokenId;
    const ticketPrice = ethers.parseEther("0.1");

    beforeEach(async function () {
      const eventDate = Math.floor(Date.now() / 1000) + 86400;
      
      await eventTicketNFT.connect(organizer).createEvent(
        "Test Event",
        "A test event",
        "Test Venue",
        eventDate,
        ticketPrice,
        100,
        "metadata-uri"
      );
      eventId = 1;

      await eventTicketNFT.connect(buyer).purchaseTicket(eventId, "ticket-uri", {
        value: ticketPrice,
      });
      tokenId = 1;
    });

    it("Should allow organizer to mark ticket as used", async function () {
      await expect(
        eventTicketNFT.connect(organizer).useTicket(tokenId)
      ).to.emit(eventTicketNFT, "TicketUsed");

      const ticket = await eventTicketNFT.getTicket(tokenId);
      expect(ticket.isUsed).to.be.true;
    });

    it("Should not allow non-organizer to mark ticket as used", async function () {
      await expect(
        eventTicketNFT.connect(buyer).useTicket(tokenId)
      ).to.be.revertedWith("Only event organizer can mark tickets as used");
    });
  });

  describe("Utility Functions", function () {
    it("Should return correct total events and tickets", async function () {
      expect(await eventTicketNFT.getTotalEvents()).to.equal(0);
      expect(await eventTicketNFT.getTotalTickets()).to.equal(0);

      const eventDate = Math.floor(Date.now() / 1000) + 86400;
      const ticketPrice = ethers.parseEther("0.1");

      await eventTicketNFT.connect(organizer).createEvent(
        "Test Event",
        "A test event",
        "Test Venue",
        eventDate,
        ticketPrice,
        100,
        "metadata-uri"
      );

      expect(await eventTicketNFT.getTotalEvents()).to.equal(1);

      await eventTicketNFT.connect(buyer).purchaseTicket(1, "ticket-uri", {
        value: ticketPrice,
      });

      expect(await eventTicketNFT.getTotalTickets()).to.equal(1);
    });

    it("Should validate ticket correctly", async function () {
      const eventDate = Math.floor(Date.now() / 1000) + 86400;
      const ticketPrice = ethers.parseEther("0.1");

      await eventTicketNFT.connect(organizer).createEvent(
        "Test Event",
        "A test event",
        "Test Venue",
        eventDate,
        ticketPrice,
        100,
        "metadata-uri"
      );

      await eventTicketNFT.connect(buyer).purchaseTicket(1, "ticket-uri", {
        value: ticketPrice,
      });

      expect(await eventTicketNFT.isTicketValid(1)).to.be.true;

      // Mark as used
      await eventTicketNFT.connect(organizer).useTicket(1);
      expect(await eventTicketNFT.isTicketValid(1)).to.be.false;
    });
  });
});