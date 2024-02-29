"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = exports.genRewardAddr = exports.genPointerAddr = exports.genEnterpriseAddr = exports.genBaseAddr = exports.genStakeKey = exports.genChangeKey = exports.genAddressSigningKey = exports.genAccountKeyPub = exports.genAccountKeyPrv = exports.genXPUB = exports.genXPRV = exports.seedPhraseToEntropy = exports.validateSeedPhrase = exports.genSeedPhrase = void 0;
var CSLwasm = require("@dcspark/cardano-multiplatform-lib-nodejs");
var bip39_1 = require("bip39");
var crypto_js_1 = require("crypto-js");
var harden = function (num) {
    return 0x80000000 + num;
};
var genSeedPhrase = function () { return __awaiter(void 0, void 0, void 0, function () {
    var mnemonic;
    return __generator(this, function (_a) {
        try {
            mnemonic = (0, bip39_1.generateMnemonic)(256);
            // console.log("new mnemonic: " + mnemonic);
            return [2 /*return*/, mnemonic];
        }
        catch (error) {
            console.error(error);
            return [2 /*return*/, error];
        }
        return [2 /*return*/];
    });
}); };
exports.genSeedPhrase = genSeedPhrase;
var validateSeedPhrase = function (seed) { return __awaiter(void 0, void 0, void 0, function () {
    var validate;
    return __generator(this, function (_a) {
        try {
            validate = (0, bip39_1.validateMnemonic)(seed);
            return [2 /*return*/, validate];
        }
        catch (error) {
            console.log(error);
            return [2 /*return*/, error];
        }
        return [2 /*return*/];
    });
}); };
exports.validateSeedPhrase = validateSeedPhrase;
var seedPhraseToEntropy = function (seed_phrase) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, (0, bip39_1.mnemonicToEntropy)(seed_phrase)];
    });
}); };
exports.seedPhraseToEntropy = seedPhraseToEntropy;
//Root private key to create accounts
var genXPRV = function (entropy) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, CSLwasm.Bip32PrivateKey.from_bip39_entropy(Buffer.from(entropy, "hex"), Buffer.from(""))];
        }
        catch (error) {
            console.log(error);
            return [2 /*return*/, error];
        }
        return [2 /*return*/];
    });
}); };
exports.genXPRV = genXPRV;
var genXPUB = function (accountKeyPrv) { return __awaiter(void 0, void 0, void 0, function () {
    var accountKeyPub, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, accountKeyPrv.to_public()];
            case 1:
                accountKeyPub = _a.sent();
                return [2 /*return*/, accountKeyPub];
            case 2:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/, error_1];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.genXPUB = genXPUB;
// account private key to create addresses
var genAccountKeyPrv = function (rootKey, purpose, coinType, accIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, rootKey
                        .derive(harden(purpose)) // purpose
                        .derive(harden(coinType)) // coin_type
                        .derive(harden(accIndex))];
            case 1: return [2 /*return*/, _a.sent()]; // account #0
            case 2:
                error_2 = _a.sent();
                console.log(error_2);
                return [2 /*return*/, error_2];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.genAccountKeyPrv = genAccountKeyPrv;
var genAccountKeyPub = function (accountKeyPrv) { return __awaiter(void 0, void 0, void 0, function () {
    var accountKeyPub, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, accountKeyPrv.to_public()];
            case 1:
                accountKeyPub = _a.sent();
                return [2 /*return*/, accountKeyPub];
            case 2:
                error_3 = _a.sent();
                console.log(error_3);
                return [2 /*return*/, error_3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.genAccountKeyPub = genAccountKeyPub;
// Address private key to sign TXs with.
var genAddressSigningKey = function (accountKeyPrv, index) { return __awaiter(void 0, void 0, void 0, function () {
    var utxoKey;
    return __generator(this, function (_a) {
        try {
            utxoKey = accountKeyPrv
                .derive(0) // 0 external || 1 change || 2 stake key
                .derive(index);
            return [2 /*return*/, utxoKey];
        }
        catch (error) {
            console.log("genAddressSigningKey", error);
            return [2 /*return*/, error];
        }
        return [2 /*return*/];
    });
}); };
exports.genAddressSigningKey = genAddressSigningKey;
var genChangeKey = function (accountKeyPrv, index) { return __awaiter(void 0, void 0, void 0, function () {
    var stakeKey;
    return __generator(this, function (_a) {
        try {
            stakeKey = accountKeyPrv
                .derive(1) // 0 external || 1 change || 2 stake key
                .derive(index);
            return [2 /*return*/, stakeKey];
        }
        catch (error) {
            console.log(error);
            return [2 /*return*/, error];
        }
        return [2 /*return*/];
    });
}); };
exports.genChangeKey = genChangeKey;
var genStakeKey = function (accountKeyPrv, index) { return __awaiter(void 0, void 0, void 0, function () {
    var stakeKey;
    return __generator(this, function (_a) {
        try {
            stakeKey = accountKeyPrv
                .derive(2) // 0 external || 1 change || 2 stake key
                .derive(index);
            return [2 /*return*/, stakeKey];
        }
        catch (error) {
            console.log(error);
            return [2 /*return*/, error];
        }
        return [2 /*return*/];
    });
}); };
exports.genStakeKey = genStakeKey;
// base address with staking key
var genBaseAddr = function (network, addressPubKey, stakeKey) { return __awaiter(void 0, void 0, void 0, function () {
    var baseAddr;
    return __generator(this, function (_a) {
        try {
            baseAddr = CSLwasm.BaseAddress.new(network, // 0 testnet || 1 mainnet
            CSLwasm.StakeCredential.from_keyhash(addressPubKey.to_raw_key().hash()), CSLwasm.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()));
            return [2 /*return*/, baseAddr];
        }
        catch (error) {
            console.log(error);
            return [2 /*return*/, error];
        }
        return [2 /*return*/];
    });
}); };
exports.genBaseAddr = genBaseAddr;
// enterprise address without staking ability, for use by exchanges/etc
var genEnterpriseAddr = function (network, addressPubKey) { return __awaiter(void 0, void 0, void 0, function () {
    var enterpriseAddr;
    return __generator(this, function (_a) {
        try {
            enterpriseAddr = CSLwasm.EnterpriseAddress.new(network, // 0 testnet || 1 mainnet
            CSLwasm.StakeCredential.from_keyhash(addressPubKey.to_raw_key().hash()));
            return [2 /*return*/, enterpriseAddr];
        }
        catch (error) {
            console.log(error);
            return [2 /*return*/, error];
        }
        return [2 /*return*/];
    });
}); };
exports.genEnterpriseAddr = genEnterpriseAddr;
// pointer address - similar to Base address but can be shorter, see formal spec for explanation
var genPointerAddr = function (network, addressPubKey) { return __awaiter(void 0, void 0, void 0, function () {
    var ptrAddr;
    return __generator(this, function (_a) {
        try {
            ptrAddr = CSLwasm.PointerAddress.new(network, // 0 testnet || 1 mainnet
            CSLwasm.StakeCredential.from_keyhash(addressPubKey.to_raw_key().hash()), CSLwasm.Pointer.new(CSLwasm.BigNum.from_str("100"), // slot
            CSLwasm.BigNum.from_str("2"), // tx index in slot
            CSLwasm.BigNum.from_str("0") // cert indiex in tx
            ));
            return [2 /*return*/, ptrAddr];
        }
        catch (error) {
            console.log(error);
            return [2 /*return*/, error];
        }
        return [2 /*return*/];
    });
}); };
exports.genPointerAddr = genPointerAddr;
// reward address - used for withdrawing accumulated staking rewards
var genRewardAddr = function (network, stakeKey) { return __awaiter(void 0, void 0, void 0, function () {
    var rewardAddr;
    return __generator(this, function (_a) {
        try {
            rewardAddr = CSLwasm.RewardAddress.new(network, // 0 testnet || 1 mainnet
            CSLwasm.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()));
            return [2 /*return*/, rewardAddr];
        }
        catch (error) {
            console.log(error);
            return [2 /*return*/, error];
        }
        return [2 /*return*/];
    });
}); };
exports.genRewardAddr = genRewardAddr;
var encrypt = function (passPhrase, text) { return __awaiter(void 0, void 0, void 0, function () {
    var encrypted, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, crypto_js_1.default.AES.encrypt(JSON.stringify(text), passPhrase).toString()];
            case 1:
                encrypted = _a.sent();
                return [2 /*return*/, encrypted];
            case 2:
                error_4 = _a.sent();
                console.log("encrypt error", error_4);
                return [2 /*return*/, error_4];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.encrypt = encrypt;
var decrypt = function (passPhrase, text) { return __awaiter(void 0, void 0, void 0, function () {
    var decrypted, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, crypto_js_1.default.AES.decrypt(text, passPhrase).toString(crypto_js_1.default.enc.Utf8)];
            case 1:
                decrypted = _a.sent();
                return [2 /*return*/, decrypted];
            case 2:
                error_5 = _a.sent();
                console.log("decreypt error", error_5);
                return [2 /*return*/, error_5];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.decrypt = decrypt;
