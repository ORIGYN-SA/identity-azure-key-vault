import { PublicKey } from '@dfinity/agent';
import { JsonWebKey } from '@azure/keyvault-keys';

export function blobFromUint8Array(arr: Uint8Array): any {
  return Buffer.from(arr);
}

export function derBlobFromBlob(blob: any): any {
  return blob as any;
}

// This implementation is adjusted from the Ed25519PublicKey.
// The RAW_KEY_LENGTH and DER_PREFIX are modified accordingly
export class Secp256k1PublicKey implements PublicKey {
  // The length of secp256k1 public keys is always 65 bytes.
  private static RAW_KEY_LENGTH = 65;

  public static fromJWK(webKey: JsonWebKey): Secp256k1PublicKey {
    const rawKey = new Uint8Array(this.RAW_KEY_LENGTH);
    rawKey.set([0x04], 0);
    rawKey.set(webKey.x!, 1);
    rawKey.set(webKey.y!, 33);
    return this.fromRaw(blobFromUint8Array(rawKey));
  }

  public static fromRaw(rawKey: any): Secp256k1PublicKey {
    return new Secp256k1PublicKey(rawKey);
  }

  public static fromDer(derKey: any): Secp256k1PublicKey {
    return new Secp256k1PublicKey(this.derDecode(derKey));
  }

  // Adding this prefix to a raw public key is sufficient to DER-encode it.
  // prettier-ignore
  private static DER_PREFIX = Uint8Array.from([
    0x30, 0x56, // SEQUENCE
    0x30, 0x10, // SEQUENCE
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01, // OID ECDSA
    0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x0a, // OID secp256k1
    0x03, 0x42, // BIT STRING
    0x00, // no padding
  ]);

  private static derEncode(publicKey: any): any {
    if (publicKey.byteLength !== Secp256k1PublicKey.RAW_KEY_LENGTH) {
      const bl = publicKey.byteLength;
      throw new TypeError(
        `secp256k1 public key must be ${Secp256k1PublicKey.RAW_KEY_LENGTH} bytes long (is ${bl})`,
      );
    }

    const derPublicKey = new Uint8Array(Secp256k1PublicKey.DER_PREFIX.byteLength + publicKey.byteLength);
    derPublicKey.set(Secp256k1PublicKey.DER_PREFIX, 0);
    derPublicKey.set(publicKey, Secp256k1PublicKey.DER_PREFIX.byteLength);

    return derBlobFromBlob(blobFromUint8Array(derPublicKey));
  }

  private static derDecode(key: any): any {
    const expectedLength = Secp256k1PublicKey.DER_PREFIX.length + Secp256k1PublicKey.RAW_KEY_LENGTH;
    if (key.byteLength !== expectedLength) {
      const bl = key.byteLength;
      throw new TypeError(
        `secp256k1 DER-encoded public key must be ${expectedLength} bytes long (is ${bl})`,
      );
    }

    const rawKey = blobFromUint8Array(key.subarray(Secp256k1PublicKey.DER_PREFIX.length));
    if (!this.derEncode(rawKey).equals(key)) {
      throw new TypeError(
        'secp256k1 DER-encoded public key is invalid. A valid secp256k1 DER-encoded public key ' +
          `must have the following prefix: ${Secp256k1PublicKey.DER_PREFIX}`,
      );
    }

    return rawKey;
  }

  private readonly rawKey: any;
  private readonly derKey: any;

  // `fromRaw` and `fromDer` should be used for instantiation, not this constructor.
  private constructor(key: any) {
    this.rawKey = key;
    this.derKey = Secp256k1PublicKey.derEncode(key);
  }

  public toDer(): any {
    return this.derKey;
  }

  public toRaw(): any {
    return this.rawKey;
  }
}
