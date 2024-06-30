const { newKit } = require('@celo/contractkit');
const { generateMnemonic } = require('@celo/utils/lib/account');
const mongoose = require('mongoose');

// Initialize Celo Kit
const kit = newKit('https://alfajores-forno.celo-testnet.org');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/celo-wallets', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const WalletSchema = new mongoose.Schema({
    email: String,
    address: String,
    mnemonic: String,
});

const Wallet = mongoose.model('Wallet', WalletSchema);

async function createWallet(email) {
    // Generate a new mnemonic
    const mnemonic = generateMnemonic();
    // Derive keys from mnemonic
    const account = await kit.web3.eth.accounts.create(mnemonic);
    const address = account.address;

    // Save to database
    const wallet = new Wallet({ email, address, mnemonic });
    await wallet.save();

    console.log(`Wallet created for ${email}`);
    console.log(`Address: ${address}`);
    console.log(`Mnemonic: ${mnemonic}`);
}

// Example usage:
createWallet('user@example.com');


/*

const { newKit } = require('@celo/contractkit');

const { generateMnemonic, generateKeys } = require('@celo/utils/lib/account');



// Initialize Celo Kit

const kit = newKit('https://alfajores-forno.celo-testnet.org');



// Generate a new mnemonic and derive keys

const mnemonic = generateMnemonic();

const { address, privateKey } = generateKeys(mnemonic);



console.log(`Generated address: ${address}`);

console.log(`Generated private key: ${privateKey}`);

console.log(`Mnemonic: ${mnemonic}`);





const mongoose = require('mongoose');



mongoose.connect('mongodb://localhost:27017/celo-wallets', {

  useNewUrlParser: true,

  useUnifiedTopology: true,

});



const WalletSchema = new mongoose.Schema({

  email: String,

  address: String,

  mnemonic: String,

});



const Wallet = mongoose.model('Wallet', WalletSchema);



async function associateEmailWithWallet(email, address, mnemonic) {

  const wallet = new Wallet({ email, address, mnemonic });

  await wallet.save();

  console.log('Wallet associated with email successfully.');

}



// Example usage:

associateEmailWithWallet('user@example.com', address, mnemonic);

*/