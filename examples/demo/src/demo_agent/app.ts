import "dotenv/config";
import { Actor, HttpAgent } from '@dfinity/agent';
import fetch from "cross-fetch";
import { AzureKeyVaultSecp256k1Identity } from '@origyn/identity-azure-key-vault'
import { idlFactory } from "./idl";

const {
  AZURE_CLIENT_ID,
  AZURE_KEY_ID,
  AZURE_VAULT_ID,
  AZURE_TENANT_ID,
  CANISTER_ID,
} = process.env

const main = async () => {
  const identity = await AzureKeyVaultSecp256k1Identity.create({
    clientId: String(AZURE_CLIENT_ID),
    keyId: String(AZURE_KEY_ID),
    vaultId: String(AZURE_VAULT_ID),
    tenantId: String(AZURE_TENANT_ID),
  });

  const agent = new HttpAgent({
    identity: identity!,
    host: "http://127.0.0.1:8000",
    fetch
  });
  const principal = await agent.getPrincipal();

  console.log("Got principal: ", principal);

  await agent.fetchRootKey()

  const actor = Actor.createActor(
    idlFactory,
    {
      agent,
      canisterId: String(CANISTER_ID)
    }
  );

  console.log("Who Am I?");
  const iAm = await actor.whoami()

  console.log("You are: ", iAm)
};

main()
