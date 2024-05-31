const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const ccpPath = path.resolve(__dirname,  '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
        const ccp = JSON.parse(ccpJSON);

        const walletPath = path.resolve(__dirname, '..', 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet,
            identity: 'user1',
            discovery: { enabled: true, asLocalhost: true }
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('document-contract');

        // Test d'efficacité : initialisation du ledger
        const initLedgerResult = await contract.submitTransaction('initLedger');
        console.log('Ledger initialized:', initLedgerResult.toString());

        // Test d'efficacité : création de document
        const documentId = 'DOC1001';
        const content = 'Test document content';
        const owner = 'User1';
        const createResult = await contract.submitTransaction('createDocument', documentId, content, owner);
        console.log('Document created:', createResult.toString());

        // Test de récupération de document
        const retrieveResult = await contract.evaluateTransaction('queryDocument', documentId);
        console.log('Retrieved document:', retrieveResult.toString());

        await gateway.disconnect();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
}

main();
