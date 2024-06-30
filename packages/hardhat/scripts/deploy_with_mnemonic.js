const { ethers } = require("hardhat");

async function main(walletMnemonic) {
    const unlockTime = getUnlockTime(60);
    const lockedAmount = ethers.utils.parseEther("0.0001");

    // Create a wallet instance from the mnemonic
    const wallet = ethers.Wallet.fromMnemonic(walletMnemonic);
    console.log(`Deploying contract with wallet address: ${wallet.address}`);

    // Connect the wallet to the provider
    const provider = new ethers.providers.JsonRpcProvider('https://alfajores-forno.celo-testnet.org');
    const connectedWallet = wallet.connect(provider);

    const Lock = await ethers.getContractFactory("Lock", connectedWallet); // Connect contract factory to the wallet

    const deploymentTransaction = getDeploymentTransaction(Lock, unlockTime);

    const estimatedGas = await estimateGas(deploymentTransaction, connectedWallet);
    const gasPrice = await getGasPrice();

    logGasDetails(estimatedGas, gasPrice);

    const deploymentCost = calculateDeploymentCost(estimatedGas, gasPrice);
    logDeploymentCost(deploymentCost);

    const balance = await getSignerBalance(connectedWallet);

    if (balance.lt(deploymentCost)) {
        console.error("Insufficient funds for deployment. Please add funds to your account.");
    } else {
        console.log("Enough funds available for deployment.");
        await deployContract(Lock, unlockTime, lockedAmount, connectedWallet);
    }
}

function getUnlockTime(secondsToAdd) {
    const currentTimestampInSeconds = Math.round(Date.now() / 1000);
    return currentTimestampInSeconds + secondsToAdd;
}

function getDeploymentTransaction(ContractFactory, unlockTime) {
    return { data: ContractFactory.getDeployTransaction(unlockTime).data };
}

async function estimateGas(transaction, signer) {
    const estimatedGas = await signer.estimateGas(transaction);
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

    // Perform any additional operations with the deployed contract if needed
}

// Export main function for external calls
module.exports = main;
