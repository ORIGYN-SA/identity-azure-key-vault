import {config} from "dotenv";
import {Actor, HttpAgent} from '@dfinity/agent';
import fetch = require("node-fetch");
import {AzureKeyVaultSecp256k1Identity} from '@origyn-sa/identity-azure-key-vault'
import {idlFactory} from "./idl";

config();

const init = async () => {
    const identity = await AzureKeyVaultSecp256k1Identity.create({
        clientId: process.env.AZURE_CLIENT_ID,
        keyId: process.env.AZURE_KEY_ID,
        vaultId: process.env.AZURE_VAULT_ID,
        tenantId: process.env.AZURE_TENANT_ID,
    });

    // @ts-ignore
    const agent = new HttpAgent({identity: identity!, host: "http://127.0.0.1:8000", fetch: fetch});
    const principal = await agent.getPrincipal();

    console.log("Got principal: ", principal);

    agent.fetchRootKey().then(() => {
        const dqueue = Actor.createActor(idlFactory, {agent, canisterId: process.env.CANISTER_ID});

        console.log("Who Am I?");
        dqueue.whoami().then(r => console.log("You are: ", r));
    });
};

init().then(() => {});
