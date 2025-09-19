const hre = require("hardhat");

async function main() {
  console.log("Deploying EventTicketNFT contract...");

  const EventTicketNFT = await hre.ethers.getContractFactory("EventTicketNFT");
  const eventTicketNFT = await EventTicketNFT.deploy();

  await eventTicketNFT.waitForDeployment();

  const contractAddress = await eventTicketNFT.getAddress();
  console.log("EventTicketNFT deployed to:", contractAddress);

  // Verify contract if not on local network
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations...");
    await eventTicketNFT.deploymentTransaction().wait(5);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification failed:", error.message);
    }
  }

  // Save contract address for frontend
  const fs = require("fs");
  const contractInfo = {
    address: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./src/contract-address.json",
    JSON.stringify(contractInfo, null, 2)
  );

  console.log("Contract address saved to src/contract-address.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });