// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
let { networkConfig } = require('../helper-hardhat-config')

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const ColeccionNFT3 = await hre.ethers.getContractFactory("ColeccionNFT3");
  const coleccion = await ColeccionNFT3.deploy();
  await coleccion.deployed();

  console.log("ColeccionNFT deployed to:", coleccion.address);

  // Signed Contract
  const accounts = await hre.ethers.getSigners()
  // console.log(accounts)
  const signer = accounts[0]
  // console.log(signer)
  const coleccion_ = new ethers.Contract(coleccion.address, ColeccionNFT3.interface, signer)
  // const networkName = networkConfig[chainId]['name']
  // log(`Verify with: \n npx hardhat verify --network ${networkName} ${coleccion_.address}`)

  // let tx_setSaleIsActive = await coleccion_.setSaleIsActive()
  // let tx = await coleccion_.mintItem(token_uri)
  // let receipt = await tx.wait(1)

  // console.log(`Podes ver el token URI aca: ${await coleccion_.tokenURI(0)}`)


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
