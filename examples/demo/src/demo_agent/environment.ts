declare global {
    namespace NodeJS {
        interface ProcessEnv {
            CANISTER_ID: string;
            AZURE_VAULT_ID: string;
            AZURE_KEY_ID: string;
            AZURE_CLIENT_ID: string;
            AZURE_CLIENT_SECRET: string;
            AZURE_TENANT_ID: string;
        }
    }
}

export {}
