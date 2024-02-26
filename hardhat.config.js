require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

const API_MAINNET_URL = process.env.API_MAINNET_URL;

const API_SEPOLIA_URL= process.env.API_SEPOLIA_URL;

const ACCOUNT_PRIVATE_KEY = process.env.ACCOUNT_PRIVATE_KEY;

module.exports = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      forking: {
        url: API_MAINNET_URL,
      }
    },
    sepolia: {
      url: API_SEPOLIA_URL,
      accounts: [ACCOUNT_PRIVATE_KEY],
    }
  },
};