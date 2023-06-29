require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
    },
    sepolia: {
      url: process.env.Alchemy_Key,
      accounts: [process.env.Private_Key]
    }
  }
};

//0xe7C4eD70783B7c3862f76DFEe11E5C06c2C3c24C
//0x538d7f8E2eB2476caA719fcBDa2eB01Ceb2C14F9
//0x36a7672e2ed2602239Aff69cB56c48e44C8DD27f