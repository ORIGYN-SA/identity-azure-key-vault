import { HttpAgentRequest, PublicKey, SignIdentity } from '@dfinity/agent';
import { BinaryBlob } from '@dfinity/candid';
export declare class AzureKeyVaultSecp256k1IdentityOpts {
    readonly tenantId: string;
    readonly clientId: string;
    readonly vaultId: string;
    readonly keyId: string;
    constructor(tenantId: string, clientId: string, vaultId: string, keyId: string);
}
export declare class AzureKeyVaultSecp256k1Identity extends SignIdentity {
    private readonly publicKey;
    private readonly cryptographyClient;
    static create(opts: AzureKeyVaultSecp256k1IdentityOpts): Promise<AzureKeyVaultSecp256k1Identity>;
    private constructor();
    getPublicKey(): PublicKey;
    sign(blob: BinaryBlob): Promise<BinaryBlob>;
    transformRequest(request: HttpAgentRequest): Promise<unknown>;
}
