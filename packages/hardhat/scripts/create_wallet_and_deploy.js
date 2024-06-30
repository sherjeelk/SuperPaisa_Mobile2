const { newKit } = require('@celo/contractkit');
const bip39 = require('bip39');
const { hdkey } = require('ethereumjs-wallet');
const mongoose = require('mongoose');
const deployContract = require('./deploy_with_mnemonic');

const kit = newKit('https://alfajores-forno.celo-testnet.org');

async function createWalletAndDeploy(email) {
    console.log(`Starting wallet creation and deployment process for email: ${email}`);

    const mnemonic = bip39.generateMnemonic();
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const hdwallet = hdkey.fromMasterSeed(seed);
    const wallet = hdwallet.derivePath("m/44'/60'/0'/0/0").getWallet();
    const address = '0x' + wallet.getAddress().toString('hex');

    console.log(`Generated wallet for email ${email}:`);
    console.log(`Address: ${address}`);
    console.log(`Mnemonic: ${mnemonic}`);

    await mongoose.connect('mongodb://localhost:27017/celo-wallets', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const WalletSchema = new mongoose.Schema({
        email: String,
        address: String,
        mnemonic: String,
    });

    const Wallet = mongoose.model('Wallet', WalletSchema);

    try {
        const walletDoc = new Wallet({ email, address, mnemonic });
        await walletDoc.save();

        console.log(`Saved wallet to database for email: ${email}`);

        await deployContract(mnemonic);

        console.log(`Deployed contract using mnemonic for email: ${email}`);
    } catch (error) {
        console.error('Error creating wallet and deploying contract:', error);
    } finally {
        await mongoose.connection.close();
        console.log(`Closed MongoDB connection for email: ${email}`);
    }
}

module.exports = {
    createWalletAndDeploy,
};
