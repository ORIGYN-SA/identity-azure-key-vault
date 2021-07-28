import { DefaultAzureCredential } from '@azure/identity';
import { CryptographyClient, KeyClient } from '@azure/keyvault-keys';
import { HttpAgentRequest, PublicKey, requestIdOf, SignIdentity } from '@dfinity/agent';
import { BinaryBlob, blobFromBuffer, blobFromUint8Array } from '@dfinity/candid';
import { Secp256k1PublicKey } from './secp256k1';
import { createHash } from 'crypto';
import { Buffer } from 'buffer/';

const domainSeparator = Buffer.from(new TextEncoder().encode('\x0Aic-request'));

export class AzureKeyVaultSecp256k1IdentityOpts {
  public constructor(
    public readonly tenantId: string,
    public readonly clientId: string,
    public readonly vaultId: string,
    public readonly keyId: string,
  ) {
  }
}

/**
 * A Remote Azure Key Vault Internet Computer Agent identity.
 */
export class AzureKeyVaultSecp256k1Identity extends SignIdentity {
  /**
   * Create a AzureKeyVaultSecp256k1Identity.
   * @param opts
   */
  public static async create(opts: AzureKeyVaultSecp256k1IdentityOpts):
    Promise<AzureKeyVaultSecp256k1Identity> {
    let { clientId, keyId, tenantId, vaultId } = opts;
    const url = `https://${vaultId}.vault.azure.net`;
    const credential = new DefaultAzureCredential({
      tenantId: tenantId,
      managedIdentityClientId: clientId,
    });
    const keyClient = new KeyClient(url, credential);
    const key = await keyClient.getKey(keyId);
    const webKey = key.key!;
    const publicKey = Secp256k1PublicKey.fromJWK(webKey);
    const cryptographyClient = new CryptographyClient(key.id!, credential);

    return new this(publicKey, cryptographyClient);
  }

  private constructor(
    private readonly publicKey: Secp256k1PublicKey,
    private readonly cryptographyClient: CryptographyClient) {
    super();
  }

  public getPublicKey(): PublicKey {
    return this.publicKey;
  }

  public async sign(blob: BinaryBlob): Promise<BinaryBlob> {
    const hash = createHash('sha256');
    const digest = hash.update(blob).digest();
    const signatureRS = await this.cryptographyClient.sign('ES256K', digest);
    const result = signatureRS?.result;
    if (result.byteLength !== 64) {
      throw new Error(`Signature must be 64 bytes long (is ${result.length})`);
    }
    return blobFromUint8Array(result);
  }

  public async transformRequest(request: HttpAgentRequest): Promise<unknown> {
    const { body, ...fields } = request;
    const requestId = await requestIdOf(body);
    return {
      ...fields,
      body: {
        content: body,
        sender_pubkey: this.getPublicKey().toDer(),
        sender_sig: await this.sign(blobFromBuffer(Buffer.concat([domainSeparator, requestId]))),
      },
    };
  }
}
