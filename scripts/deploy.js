const { ethers } = require("hardhat");
require("dotenv").config({ path: ".env" });

async function main() {
  // URL from where we can extract the metadata for a TAW
  const metadataURL = "ipfs://QmceCfRwVZSrR4gA6c64njLdktVaWsFuhNUqkUf7m2TB3q/";
  /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so lw3PunksContract here is a factory for instances of our TAW contract.
  */
  const tawContract = await ethers.getContractFactory("TAW");

  // deploy the contract
  const deployedtawContract = await tawContract.deploy(metadataURL);

  await deployedtawContract.deployed();

  // print the address of the deployed contract
  console.log("TAW Contract Address:", deployedtawContract.address);
}

// Call the main function and catch if there is any error
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });