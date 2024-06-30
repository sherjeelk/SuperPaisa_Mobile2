const { newKit } = require('@celo/contractkit');
const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const mongoose = require('mongoose');
const deployContract = require('./deploy_with_mnemonic'); // Assuming deploy.js is in the same directory

// Initialize Celo Kit
const kit = newKit('https://alfajores-forno.celo-testnet.org');

async function createWalletAndDeploy(email) {
    // Generate a new mnemonic
    const mnemonic = bip39.generateMnemonic();

    // Generate seed from mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic);

    // Generate HD wallet
    const hdwallet = hdkey.fromMasterSeed(seed);

    // Derive the first account using the BIP44 path
    const wallet = hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
    const address = '0x' + wallet.getAddress().toString('hex');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/celo-wallets', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // Define schema and model
    const WalletSchema = new mongoose.Schema({
        email: String,
        address: String,
        mnemonic: String,
    });

    const Wallet = mongoose.model('Wallet', WalletSchema);

    try {
        // Save to database
        const walletDoc = new Wallet({ email, address, mnemonic });
        await walletDoc.save();

        console.log(`Wallet created for ${email}`);
        console.log(`Address: ${address}`);
        console.log(`Mnemonic: ${mnemonic}`);

        // Deploy contract using the newly created wallet mnemonic
        await deployContract(mnemonic); // Pass the mnemonic to deploy.js

    } catch (error) {
        console.error('Error saving wallet to database:', error);
    } finally {
        // Close MongoDB connection
        await mongoose.connection.close();
    }
}

// Example usage:
/*
createWallet('testuser@superpaisa.com').then(() => {
    // Ensure script exits after completion
    process.exit(0);
}).catch(err => {
    console.error('Error creating wallet:', err);
    process.exit(1);
});
*/

module.exports = {
    createWalletAndDeploy,
};