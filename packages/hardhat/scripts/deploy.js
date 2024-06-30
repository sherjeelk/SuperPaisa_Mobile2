// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");

async function main() {
    const unlockTime = getUnlockTime(60);
    const lockedAmount = ethers.utils.parseEther("0.0001");

    const Lock = await ethers.getContractFactory("Lock");
    const deploymentTransaction = getDeploymentTransaction(Lock, unlockTime);

    const estimatedGas = await estimateGas(deploymentTransaction);
    const gasPrice = await getGasPrice();

    logGasDetails(estimatedGas, gasPrice);

    const deploymentCost = calculateDeploymentCost(estimatedGas, gasPrice);
    logDeploymentCost(deploymentCost);

    const [signer] = await ethers.getSigners();
    const balance = await getSignerBalance(signer);

    if (balance.lt(deploymentCost)) {
        console.error("Insufficient funds for deployment. Please add funds to your account.");
    } else {
        console.log("Enough funds available for deployment.");
        await deployContract(Lock, unlockTime, lockedAmount, signer);
    }
}

function getUnlockTime(secondsToAdd) {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    return currentTimestampInSeconds + secondsToAdd;
}

function getDeploymentTransaction(ContractFactory, unlockTime) {
    return { data: ContractFactory.getDeployTransaction(unlockTime).data };
}

async function estimateGas(transaction) {
    const estimatedGas = await ethers.provider.estimateGas(transaction);
    console.log(`Estimated Gas: ${estimatedGas.toString()}`);
    return estimatedGas;
}

async function getGasPrice() {
    const gasPrice = await ethers.provider.getGasPrice();
    console.log(`Current Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")} gwei`);
    return gasPrice;
}

function logGasDetails(estimatedGas, gasPrice) {
    console.log(`Estimated Gas: ${estimatedGas.toString()}`);
    console.log(`Current Gas Price: ${ethers.utils.formatUnits(gasPrice, "gwei")} gwei`);
}

function calculateDeploymentCost(estimatedGas, gasPrice) {
    return estimatedGas.mul(gasPrice);
}

function logDeploymentCost(deploymentCost) {
    console.log(`Estimated Deployment Cost: ${ethers.utils.formatEther(deploymentCost)} ETH`);
}

async function getSignerBalance(signer) {
    const balance = await signer.getBalance();
    console.log(`Signer's Balance: ${ethers.utils.formatEther(balance)} ETH`);
    console.log(`Signer address: ${signer.address}`);
    return balance;
}

async function deployContract(ContractFactory, unlockTime, lockedAmount, signer) {
    const contract = await ContractFactory.deploy(unlockTime, { value: lockedAmount });
    console.log(`Unlock Time: ${unlockTime}`);
    await contract.deployed();
    const networkName = contract.deployTransaction.chainId; // Updated to use chainId
    console.log(`Deployed to network: ${networkName}`);
    console.log(`Lock with 0.0001 ETH and unlock timestamp ${unlockTime} deployed to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
