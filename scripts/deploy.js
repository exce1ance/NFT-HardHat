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
    console.log("Comienza el deploy...");
    const ColeccionNFT3 = await hre.ethers.getContractFactory("ColeccionNFT3");
    const coleccion = await ColeccionNFT3.deploy();
    await coleccion.deployed();
    console.log("Contract deployed to:", coleccion.address);

    // Signed Contract
    // const accounts = await hre.ethers.getSigners()
    // const signer = accounts[0]
    // const coleccion_ = new ethers.Contract(coleccion.address, ColeccionNFT3.interface, signer)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
