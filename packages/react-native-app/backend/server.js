const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const hardhatProjectPath = path.resolve(__dirname, '../../hardhat');
process.chdir(hardhatProjectPath);

const createWalletAndDeployPath = path.resolve(hardhatProjectPath, 'scripts/create_wallet_and_deploy');
const { createWalletAndDeploy } = require(createWalletAndDeployPath);

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

app.post('/create-wallet-and-deploy', async (req, res) => {
    const { email } = req.body;

    try {
        console.log(`Received request to create wallet for email: ${email}`);
        
        await createWalletAndDeploy(email);
        
        console.log(`Wallet creation and deployment successful for email: ${email}`);
        res.status(200).send('Wallet creation and contract deployment initiated.');
    } catch (error) {
        console.error('Error creating wallet and deploying contract:', error);
        res.status(500).send('Internal server error.');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
