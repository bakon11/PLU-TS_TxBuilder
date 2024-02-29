"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.seconds_to_days_hours_mins_secs_str = exports.calculateEpochTimeLeft = exports.toHex = exports.fromHex = exports.a2hex = exports.hex2a = exports.splitAsset = exports.metadataCbortoJSON = exports.CarpApi = exports.convertAddressToStake = exports.genKeys = exports.kupoAPI = exports.koiosAPI = exports.ogmiosHealth = void 0;
var CSLwasm = require("@dcspark/cardano-multiplatform-lib-nodejs");
var crypto_1 = require("./crypto");
var cbor_x_1 = require("cbor-x");
var node_buffer_1 = require("node:buffer");
var fs = require("fs");
var node_fetch_1 = require("node-fetch");
var mandaladb = "../server/typescript/db/mandala.db";
// const ogmiosServer = "http://192.168.8.2:1337";
// const kupoServer = "http://192.168.8.3:1442";
//const carpServer = "http://192.168.8.2:3000";
var ogmiosServer = "https://ogmiosmain.onchainapps.io";
var kupoServer = "https://kupomain.onchainapps.io";
var carpServer = "https://carp.onchainapps.io";
var koiosServer = "https://api.koios.rest/api/v1";
/*
##########################################################################################################
Fetching Chain info and Ogmios health
#############################d############################################################################
*/
var ogmiosHealth = function () { return __awaiter(void 0, void 0, void 0, function () {
    var requestOptions, settings, fetchResponse, data, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requestOptions = {
                    method: "GET",
                    redirect: "follow",
                };
                settings = {};
                settings = {
                    method: "GET",
                    headers: {},
                    redirect: "follow",
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, (0, node_fetch_1.default)("".concat(ogmiosServer, "/health"), requestOptions)];
            case 2:
                fetchResponse = _a.sent();
                return [4 /*yield*/, fetchResponse.json()];
            case 3:
                data = _a.sent();
                // console.log(data);
                return [2 /*return*/, data];
            case 4:
                e_1 = _a.sent();
                console.log(e_1);
                return [2 /*return*/, e_1];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.ogmiosHealth = ogmiosHealth;
/*
##########################################################################################################
Fetching ProtocolParams from Koios API V1
#############################d############################################################################
*/
var koiosAPI = function (uri) { return __awaiter(void 0, void 0, void 0, function () {
    var requestOptions, settings, fetchResponse, data, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requestOptions = {
                    method: "GET",
                    redirect: "follow",
                };
                settings = {};
                settings = {
                    method: "GET",
                    headers: {},
                    redirect: "follow",
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, (0, node_fetch_1.default)("".concat(koiosServer, "/").concat(uri), requestOptions)];
            case 2:
                fetchResponse = _a.sent();
                return [4 /*yield*/, fetchResponse.json()];
            case 3:
                data = _a.sent();
                // console.log(data);
                return [2 /*return*/, data];
            case 4:
                e_2 = _a.sent();
                console.log(e_2);
                return [2 /*return*/, e_2];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.koiosAPI = koiosAPI;
/*
##########################################################################################################
Fetching UTXO from Kupo API
#############################d############################################################################
*/
var kupoAPI = function (uri) { return __awaiter(void 0, void 0, void 0, function () {
    var settings, fetchResponse, data, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                settings = {};
                settings = {
                    method: "GET",
                    headers: {},
                    redirect: "follow",
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, (0, node_fetch_1.default)("".concat(kupoServer, "/").concat(uri), settings)];
            case 2:
                fetchResponse = _a.sent();
                return [4 /*yield*/, fetchResponse.json()];
            case 3:
                data = _a.sent();
                // console.log(data);
                return [2 /*return*/, data];
            case 4:
                e_3 = _a.sent();
                console.log(e_3);
                return [2 /*return*/, e_3];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.kupoAPI = kupoAPI;
/*
##########################################################################################################
Generate addresses and keys and save them to keys.json.
keys.json needs to have seedphrase and spending password included before hand.
#############################d############################################################################
*/
var genKeys = function () { return __awaiter(void 0, void 0, void 0, function () {
    var keys, seedPhrase, walletPassword, entropy, rootXPRV, accountKeyPrv, accountAddressKeyPrv, accountStakeKeyPrv, baseAddress, stakeAddress, newKeys;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                keys = fs.readFileSync("keys.json", "utf8");
                seedPhrase = JSON.parse(keys).seedPhrase;
                walletPassword = JSON.parse(keys).walletPassword;
                // const seedPhrase = await genSeedPhrase();
                console.log("seedPhrase", seedPhrase);
                return [4 /*yield*/, (0, crypto_1.seedPhraseToEntropy)(seedPhrase)];
            case 1:
                entropy = _b.sent();
                console.log("entropy", entropy);
                return [4 /*yield*/, (0, crypto_1.genXPRV)(entropy)];
            case 2:
                rootXPRV = _b.sent();
                // console.log("rootXPRV", rootXPRV.to_bech32());
                // console.log("rootXPUB", rootXPRV.to_public().to_bech32());
                console.log("creating wallet/account/address");
                return [4 /*yield*/, (0, crypto_1.genAccountKeyPrv)(rootXPRV, 1852, 1815, 0)];
            case 3:
                accountKeyPrv = _b.sent();
                return [4 /*yield*/, (0, crypto_1.genAddressSigningKey)(accountKeyPrv, 0)];
            case 4:
                accountAddressKeyPrv = _b.sent();
                return [4 /*yield*/, (0, crypto_1.genStakeKey)(accountKeyPrv, 0)];
            case 5:
                accountStakeKeyPrv = _b.sent();
                return [4 /*yield*/, (0, crypto_1.genBaseAddr)(1, accountAddressKeyPrv.to_public(), accountStakeKeyPrv.to_public())];
            case 6:
                baseAddress = _b.sent();
                return [4 /*yield*/, (0, crypto_1.genRewardAddr)(1, accountStakeKeyPrv.to_public())];
            case 7:
                stakeAddress = _b.sent();
                _a = {
                    seedPhrase: seedPhrase,
                    walletPassword: walletPassword,
                    walletID: rootXPRV.to_public().to_bech32().slice(100),
                    accountIndex: 0
                };
                return [4 /*yield*/, (0, crypto_1.encrypt)(walletPassword, rootXPRV.to_bech32())];
            case 8:
                // walletName: !walletName ? "wallet " + 0 : walletName,
                _a.rootXPRV = _b.sent(),
                    _a.rootXPUB = rootXPRV.to_public().to_bech32();
                return [4 /*yield*/, (0, crypto_1.encrypt)(walletPassword, accountKeyPrv.to_bech32())];
            case 9:
                _a.accountKeyPrv = _b.sent(),
                    _a.accountKeyPub = accountAddressKeyPrv.to_public().to_bech32();
                return [4 /*yield*/, (0, crypto_1.encrypt)(walletPassword, accountAddressKeyPrv.to_bech32())];
            case 10:
                _a.accountAddressKeyPrv = _b.sent(),
                    _a.accountAddressKeyPub = accountAddressKeyPrv.to_public().to_bech32();
                return [4 /*yield*/, (0, crypto_1.encrypt)(walletPassword, accountStakeKeyPrv.to_bech32())];
            case 11:
                newKeys = (_a.accountStakeKeyPrv = _b.sent(),
                    _a.accountStakeKeyPub = accountStakeKeyPrv.to_public().to_bech32(),
                    _a.baseAddress_bech32 = baseAddress.to_address().to_bech32(),
                    _a.baseAddress_hex = baseAddress.to_address().to_hex(),
                    _a.stakeAddress = stakeAddress.to_address().to_bech32(),
                    _a);
                console.log("new keys: ", newKeys);
                fs.writeFileSync("keys.json", JSON.stringify(__assign({}, newKeys), null, 2));
                return [2 /*return*/];
        }
    });
}); };
exports.genKeys = genKeys;
/*
##########################################################################################################
Parse stake address from base address
#############################d############################################################################
*/
var convertAddressToStake = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var stake_cred, reward_addr_bytes, reward_addr, stake_addr, stakePKH;
    var _a, _b;
    return __generator(this, function (_c) {
        stake_cred = (_b = (_a = CSLwasm.BaseAddress) === null || _a === void 0 ? void 0 : _a.from_address(CSLwasm.Address.from_bech32(address))) === null || _b === void 0 ? void 0 : _b.stake_cred();
        reward_addr_bytes = new Uint8Array(29);
        reward_addr_bytes.set([0xe1], 0);
        reward_addr_bytes.set(stake_cred.to_bytes().slice(4, 32), 1);
        reward_addr = CSLwasm.RewardAddress.from_address(CSLwasm.Address.from_bytes(reward_addr_bytes));
        stake_addr = reward_addr.to_address().to_bech32();
        stakePKH = node_buffer_1.Buffer.from(reward_addr_bytes).toString("hex").slice(2);
        // console.log("stakePKH", stakePKH);
        return [2 /*return*/, stake_addr];
    });
}); };
exports.convertAddressToStake = convertAddressToStake;
/*
##########################################################################################################
DcSPark CarpApi
#############################d############################################################################
*/
var CarpApi = function (jsonRaw) { return __awaiter(void 0, void 0, void 0, function () {
    var settings, fetchResponse, data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                settings = {};
                settings = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(jsonRaw),
                    redirect: "follow",
                    mode: "cors",
                };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, (0, node_fetch_1.default)("".concat(carpServer, "/metadata/nft"), settings)];
            case 2:
                fetchResponse = _a.sent();
                data = fetchResponse;
                if (!(data.status === 200)) return [3 /*break*/, 4];
                return [4 /*yield*/, data.json()];
            case 3: return [2 /*return*/, _a.sent()];
            case 4: return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.log("carp api error", error_1);
                return [2 /*return*/, "error"];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.CarpApi = CarpApi;
/*
##########################################################################################################
Take CIP25 metadata and convert it to JSON
#############################d############################################################################
*/
var metadataCbortoJSON = function (cborString) { return __awaiter(void 0, void 0, void 0, function () {
    var metadataJSON, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, cbor_x_1.decode)((0, exports.fromHex)(cborString))];
            case 1:
                metadataJSON = _a.sent();
                // console.log("cborJson", metadataJSON);
                return [2 /*return*/, metadataJSON];
            case 2:
                error_2 = _a.sent();
                console.log("cborJson Error", error_2);
                return [2 /*return*/, error_2];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.metadataCbortoJSON = metadataCbortoJSON;
/*
##########################################################################################################
Take cardano POlicy.Asset and split into two parts
#############################d############################################################################
*/
var splitAsset = function (asset) {
    return asset.split(".");
};
exports.splitAsset = splitAsset;
var hex2a = function (hexx) {
    var hex = hexx.toString(); //force conversion
    var str = "";
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
};
exports.hex2a = hex2a;
var a2hex = function (ascii) {
    var arr1 = [];
    for (var n = 0, l = ascii.length; n < l; n++) {
        var hex = Number(ascii.charCodeAt(n)).toString(16);
        arr1.push(hex);
    }
    return arr1.join("");
};
exports.a2hex = a2hex;
var fromHex = function (hex) {
    return node_buffer_1.Buffer.from(hex, "hex");
};
exports.fromHex = fromHex;
var toHex = function (bytes) {
    return node_buffer_1.Buffer.from(bytes).toString("hex");
};
exports.toHex = toHex;
/*
##########################################################################################################
Take cardano current slot and calculate time left in epoch
#############################d############################################################################
*/
var calculateEpochTimeLeft = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var timeLeftPercent, timeLeftSeconds, timeStats;
    return __generator(this, function (_a) {
        timeLeftPercent = (data.slotInEpoch / 432000) * 100;
        timeLeftSeconds = 432000 - data.slotInEpoch;
        timeStats = {
            timeLeftPercent: timeLeftPercent,
            timeLeftSeconds: timeLeftSeconds,
            timeHuman: (0, exports.seconds_to_days_hours_mins_secs_str)(timeLeftSeconds),
        };
        console.log("timeStats", timeStats);
        return [2 /*return*/, timeStats];
    });
}); };
exports.calculateEpochTimeLeft = calculateEpochTimeLeft;
var seconds_to_days_hours_mins_secs_str = function (seconds) {
    // day, h, m and s
    var days = Math.floor(seconds / (24 * 60 * 60));
    seconds -= days * (24 * 60 * 60);
    var hours = Math.floor(seconds / (60 * 60));
    seconds -= hours * (60 * 60);
    var minutes = Math.floor(seconds / 60);
    seconds -= minutes * 60;
    return (0 < days ? days + " days, " : "") + hours + "h, " + minutes + "m, " + seconds + "s";
};
exports.seconds_to_days_hours_mins_secs_str = seconds_to_days_hours_mins_secs_str;
