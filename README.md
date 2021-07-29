# @origyn-sa/identity-azure-key-vault

TypeScript library to support a Azure Key Vault identity for applications on the [Internet Computer](https://dfinity.org/).

It uses ECDSA using P-256K and SHA-256, as described in [RFC7518](https://tools.ietf.org/html/rfc7518).

Visit the [Dfinity Forum](https://forum.dfinity.org/) and [SDK Documentation](https://sdk.dfinity.org/docs/index.html) for more information and support building on the Internet Computer.

---

## Installation

Using authentication:

```
npm i --save @origyn-sa/identity-azure-key-vault
```

### In the node.js application:

```javascript
import {config} from "dotenv";
import {HttpAgent} from '@dfinity/agent';
import {AzureKeyVaultSecp256k1Identity} from '@origyn-sa/identity-azure-key-vault'

config();

// ...
const identity = await AzureKeyVaultSecp256k1Identity.create({
    clientId: process.env.AZURE_CLIENT_ID,
    keyId: process.env.AZURE_KEY_ID,
    vaultId: process.env.AZURE_VAULT_ID,
    tenantId: process.env.AZURE_TENANT_ID,
});

const agent = new HttpAgent({identity: identity, /* rest of config .... */});
```

Sample `.env` can be found in examples/demo/.env.sample, as well all keys are defined in `src/demo_agent/environment.ts`.  

Note: depends on [@dfinity/agent](https://www.npmjs.com/package/@dfinity/agent) and [@dfinity/identity](https://www.npmjs.com/package/@dfinity/identity).

### Example application

You can find example of library usage in `examples/demo`, to run it follow those steps:

- change directory: `cd examples/demo`;
- install npm packages: `npm install`;
- from the same dir, but from another terminal (as well can be started as background job) run local IC: `dfx start`;
- from `examples/demo` run `dfx deploy`;
- create your own `.env` file based on `.env.sample`, `CANISTER_ID` will be shown after deployment;
- after deployment succeeds run node.js application with `npm run start`;
- experiment with changing source code, `nodemon` will recompile your application when it will be updated.
