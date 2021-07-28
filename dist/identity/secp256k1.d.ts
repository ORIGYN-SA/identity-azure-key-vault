import { PublicKey } from '@dfinity/agent';
import { BinaryBlob, DerEncodedBlob } from '@dfinity/candid';
import { JsonWebKey } from '@azure/keyvault-keys';
export declare class Secp256k1PublicKey implements PublicKey {
    private static RAW_KEY_LENGTH;
    static fromJWK(webKey: JsonWebKey): Secp256k1PublicKey;
    static fromRaw(rawKey: BinaryBlob): Secp256k1PublicKey;
    static fromDer(derKey: BinaryBlob): Secp256k1PublicKey;
    private static DER_PREFIX;
    private static derEncode;
    private static derDecode;
    private readonly rawKey;
    private readonly derKey;
    private constructor();
    toDer(): DerEncodedBlob;
    toRaw(): BinaryBlob;
}
