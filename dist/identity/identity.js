"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureKeyVaultSecp256k1Identity = exports.AzureKeyVaultSecp256k1IdentityOpts = void 0;
const identity_1 = require("@azure/identity");
const keyvault_keys_1 = require("@azure/keyvault-keys");
const agent_1 = require("@dfinity/agent");
const candid_1 = require("@dfinity/candid");
const secp256k1_1 = require("./secp256k1");
const crypto_1 = require("crypto");
const agent_2 = require("@dfinity/agent");
const candid_2 = require("@dfinity/candid");
const buffer_1 = require("buffer/");
const domainSeparator = buffer_1.Buffer.from(new TextEncoder().encode('\x0Aic-request'));
class AzureKeyVaultSecp256k1IdentityOpts {
    constructor(tenantId, clientId, vaultId, keyId) {
        this.tenantId = tenantId;
        this.clientId = clientId;
        this.vaultId = vaultId;
        this.keyId = keyId;
    }
}
exports.AzureKeyVaultSecp256k1IdentityOpts = AzureKeyVaultSecp256k1IdentityOpts;
class AzureKeyVaultSecp256k1Identity extends agent_1.SignIdentity {
    constructor(publicKey, cryptographyClient) {
        super();
        this.publicKey = publicKey;
        this.cryptographyClient = cryptographyClient;
    }
    static async create(opts) {
        let { clientId, keyId, tenantId, vaultId } = opts;
        const url = `https://${vaultId}.vault.azure.net`;
        const credential = new identity_1.DefaultAzureCredential({
            tenantId: tenantId,
            managedIdentityClientId: clientId,
        });
        const keyClient = new keyvault_keys_1.KeyClient(url, credential);
        const key = await keyClient.getKey(keyId);
        const webKey = key.key;
        const publicKey = secp256k1_1.Secp256k1PublicKey.fromJWK(webKey);
        const cryptographyClient = new keyvault_keys_1.CryptographyClient(key.id, credential);
        return new this(publicKey, cryptographyClient);
    }
    getPublicKey() {
        return this.publicKey;
    }
    async sign(blob) {
        const hash = crypto_1.createHash('sha256');
        const digest = hash.update(blob).digest();
        const signatureRS = await this.cryptographyClient.sign('ES256K', digest);
        const result = signatureRS === null || signatureRS === void 0 ? void 0 : signatureRS.result;
        if (result.byteLength !== 64) {
            throw new Error(`Signature must be 64 bytes long (is ${result.length})`);
        }
        return candid_1.blobFromUint8Array(result);
    }
    async transformRequest(request) {
        const { body } = request, fields = __rest(request, ["body"]);
        const requestId = await agent_2.requestIdOf(body);
        return Object.assign(Object.assign({}, fields), { body: {
                content: body,
                sender_pubkey: this.getPublicKey().toDer(),
                sender_sig: await this.sign(candid_2.blobFromBuffer(buffer_1.Buffer.concat([domainSeparator, requestId]))),
            } });
    }
}
exports.AzureKeyVaultSecp256k1Identity = AzureKeyVaultSecp256k1Identity;
//# sourceMappingURL=identity.js.map