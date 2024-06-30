// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { ethers, run, network } = require("hardhat")

async function main() {



    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    const SIXTY_SECS = 60;
    const unlockTime = currentTimestampInSeconds + SIXTY_SECS;

    const lockedAmount = hre.ethers.utils.parseEther("0.0001");
    const Lock = await hre.ethers.getContractFactory("Lock");

    const deploymentTransaction = {
        data: Lock.getDeployTransaction(unlockTime).data,
    };

    const estimatedGas = await ethers.provider.estimateGas(deploymentTransaction);
    console.log(`Estimated Gas: ${estimatedGas.toString()}`);

    // Get current gas price
    const gasPrice = await ethers.provider.getGasPrice();
    console.log(`Current Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")} gwei`);

    // Calculate the deployment cost
    const deploymentCost = estimatedGas.mul(gasPrice);
    console.log(`Estimated Deployment Cost: ${ethers.utils.formatEther(deploymentCost)} ETH`);


    // Get the signer from the CELO network
    const [signer] = await ethers.getSigners();
    console.log(`Signer address: ${signer.address}`);

    // Get the signer's balance
    const balance = await signer.getBalance();
    console.log(`Signer's Balance: ${ethers.utils.formatEther(balance)} ETH`);

    if (balance.lt(deploymentCost)) {

        console.error("Insufficient funds for deployment. Please add funds to your account.");
    }
    else {
        console.log("Enough funds available for deployment.");

        // Deploy the contract
        const lock = await Lock.deploy(unlockTime, { value: lockedAmount });
        console.log(`Unlock Time: ${unlockTime}`);
        await lock.deployed();
        const networkName = lock.networkName;
        console.log(`Deployed to network: ${networkName}`);

        console.log(
            `Lock with 0.0001 ETH and unlock timestamp ${unlockTime} deployed to ${lock.address}`
        );

    }

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
