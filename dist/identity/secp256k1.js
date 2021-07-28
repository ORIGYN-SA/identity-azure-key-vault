"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Secp256k1PublicKey = void 0;
const candid_1 = require("@dfinity/candid");
class Secp256k1PublicKey {
    constructor(key) {
        this.rawKey = key;
        this.derKey = Secp256k1PublicKey.derEncode(key);
    }
    static fromJWK(webKey) {
        const rawKey = new Uint8Array(this.RAW_KEY_LENGTH);
        rawKey.set([0x04], 0);
        rawKey.set(webKey.x, 1);
        rawKey.set(webKey.y, 33);
        return this.fromRaw(candid_1.blobFromUint8Array(rawKey));
    }
    static fromRaw(rawKey) {
        return new Secp256k1PublicKey(rawKey);
    }
    static fromDer(derKey) {
        return new Secp256k1PublicKey(this.derDecode(derKey));
    }
    static derEncode(publicKey) {
        if (publicKey.byteLength !== Secp256k1PublicKey.RAW_KEY_LENGTH) {
            const bl = publicKey.byteLength;
            throw new TypeError(`secp256k1 public key must be ${Secp256k1PublicKey.RAW_KEY_LENGTH} bytes long (is ${bl})`);
        }
        const derPublicKey = new Uint8Array(Secp256k1PublicKey.DER_PREFIX.byteLength + publicKey.byteLength);
        derPublicKey.set(Secp256k1PublicKey.DER_PREFIX, 0);
        derPublicKey.set(publicKey, Secp256k1PublicKey.DER_PREFIX.byteLength);
        return candid_1.derBlobFromBlob(candid_1.blobFromUint8Array(derPublicKey));
    }
    static derDecode(key) {
        const expectedLength = Secp256k1PublicKey.DER_PREFIX.length + Secp256k1PublicKey.RAW_KEY_LENGTH;
        if (key.byteLength !== expectedLength) {
            const bl = key.byteLength;
            throw new TypeError(`secp256k1 DER-encoded public key must be ${expectedLength} bytes long (is ${bl})`);
        }
        const rawKey = candid_1.blobFromUint8Array(key.subarray(Secp256k1PublicKey.DER_PREFIX.length));
        if (!this.derEncode(rawKey).equals(key)) {
            throw new TypeError('secp256k1 DER-encoded public key is invalid. A valid secp256k1 DER-encoded public key ' +
                `must have the following prefix: ${Secp256k1PublicKey.DER_PREFIX}`);
        }
        return rawKey;
    }
    toDer() {
        return this.derKey;
    }
    toRaw() {
        return this.rawKey;
    }
}
exports.Secp256k1PublicKey = Secp256k1PublicKey;
Secp256k1PublicKey.RAW_KEY_LENGTH = 65;
Secp256k1PublicKey.DER_PREFIX = Uint8Array.from([
    0x30, 0x56,
    0x30, 0x10,
    0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01,
    0x06, 0x05, 0x2b, 0x81, 0x04, 0x00, 0x0a,
    0x03, 0x42,
    0x00,
]);
//# sourceMappingURL=secp256k1.js.map