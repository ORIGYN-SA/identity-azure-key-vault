import { DefaultAzureCredential } from '@azure/identity';
import { CryptographyClient, KeyClient } from '@azure/keyvault-keys';
import { SignIdentity, PublicKey } from '@dfinity/agent';
import { BinaryBlob } from '@dfinity/candid';
import { Principal } from '@dfinity/principal';
import { Secp256k1PublicKey } from './secp256k1';
import { createHash } from 'crypto';
import { blobFromUint8Array } from '@dfinity/candid';

export class AzureKeyVaultSecp256k1IdentityOpts {
  tenantId: string;
  clientId: string;
  vaultId: string;
  keyId: string;
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
    const principal = Principal.selfAuthenticating(publicKey.toDer());
    const cryptographyClient = new CryptographyClient(key.id!, credential);

    return new this(principal, publicKey, cryptographyClient);
  }

  private constructor(
    private readonly principal: Principal,
    private readonly publicKey: Secp256k1PublicKey,
    private readonly cryptographyClient: CryptographyClient) {
    super();
  }

  public getPrincipal(): Principal {
    return this.principal;
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
}
