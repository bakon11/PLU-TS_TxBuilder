import * as CSLwasm from "@dcspark/cardano-multiplatform-lib-nodejs";
import { decode } from 'cbor-x';
import { Buffer } from 'node:buffer';
const mandaladb = "../server/typescript/db/mandala.db";
// const ogmiosServer = "http://192.168.8.2:1337";
// const kupoServer = "http://192.168.8.3:1442";
//const carpServer = "http://192.168.8.2:3000";
const ogmiosServer = "https://ogmiosmain.onchainapps.io";
const kupoServer = "https://kupomain.onchainapps.io";
const carpServer = "https://carp.onchainapps.io";

/*
##########################################################################################################
Fetching Chain info and Ogmios health
#############################d############################################################################
*/
export const ogmiosHealth = async () => {
  let agent;
  type === "http" ? agent = new http.Agent({rejectUnauthorized: false}) : agent = new https.Agent({rejectUnauthorized: false});
  let data;
  const queryOgmiosRes = await fetch(`${ogmiosServer}/health`, { agent });
  // console.log("queryOgmiosRes", queryOgmiosRes);
  if (queryOgmiosRes.ok) {
    data = await queryOgmiosRes.json();
  };
  // console.log(data);
  return(data);
};

/*
##########################################################################################################
Fetching ProtocolParams from Koios API V1
#############################d############################################################################
*/
export const koiosAPI = async ( uri ) => {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  let settings= {};
  settings = {
    method: "GET",
    headers: {},
    redirect: "follow"
  };
  try {
    const fetchResponse = await fetch(`https://api.koios.rest/api/v1/${uri}`, requestOptions);
    const data = await fetchResponse.json();
    // console.log(data);
    return(data);
  } catch (e) {
    console.log(e);
    return e;
  };
};

/*
##########################################################################################################
Fetching UTXO from Kupo API
#############################d############################################################################
*/
export const kupoAPI = async ( uri ) => {
  let settings= {};
  settings = {
    method: "GET",
    headers: {},
    redirect: "follow"
  };
  try {
    const fetchResponse = await fetch(`${kupoServer}/${uri}`, settings);
    const data = await fetchResponse.json();
    // console.log(data);
    return(data);
  } catch (e) {
    console.log(e);
    return e;
  };
};

/*
##########################################################################################################
Generate addresses and keys and save them to keys.json.
keys.json needs to have seedphrase and spending password included before hand.
#############################d############################################################################
*/
export const genKeys = async () => {
  let keys = fs.readFileSync('keys.json', 'utf8');
  // console.log("keys", keys);
  const seedPhrase = JSON.parse(keys).seedPhrase;
  const walletPassword = JSON.parse(keys).walletPassword;
  // const seedPhrase = await genSeedPhrase();
  console.log("seedPhrase", seedPhrase);
  const entropy = await seedPhraseToEntropy(seedPhrase);
  console.log("entropy", entropy);
  const rootXPRV = await genXPRV(entropy);
  // console.log("rootXPRV", rootXPRV.to_bech32());
  // console.log("rootXPUB", rootXPRV.to_public().to_bech32());
  console.log("creating wallet/account/address");
    const accountKeyPrv = await genAccountKeyPrv( rootXPRV, 1852, 1815, 0 );
    // console.log("accountKeyPrv", await encrypt( walletPassword, accountKeyPrv.to_bech32() ));
    // let keyBech = accountKeyPrv.to_bech32();
    // console.log("accountKeyPrv", keyBech.to_raw_key());
    // console.log("accountKeyPub", accountKeyPrv.to_public().to_bech32());
    const accountAddressKeyPrv = await genAddressSigningKey(accountKeyPrv, 0);
    // console.log("AccountAddressKeyPrv Key", await encrypt( walletPassword, accountAddressKeyPrv.to_bech32()));
    // console.log("AccountAddressKeyPRV Key", accountAddressKeyPrv.to_bech32());
    // console.log("AccountAddressKeyPUB Key", accountAddressKeyPrv.to_public().to_bech32());
    const accountStakeKeyPrv = await genStakeKey(accountKeyPrv, 0);
    // console.log("accountStakeKeyPrv", await encrypt( walletPassword, accountStakeKeyPrv.to_bech32()));
    // console.log("accountStakeKeyPrv", accountStakeKeyPrv.to_bech32());
    // console.log("accountStakeKeyPub", accountStakeKeyPrv.to_public().to_bech32());
    const baseAddress = await genBaseAddr( 1, accountAddressKeyPrv.to_public(), accountStakeKeyPrv.to_public());
    // console.log("baseAddress", baseAddress.to_address().to_bech32());
    const stakeAddress = await genRewardAddr( 1,  accountStakeKeyPrv.to_public() );
    // console.log("stakeAddress", stakeAddress.to_address().to_bech32());
    // create/upgrade the database without version checks
    let newKeys = {
      seedPhrase,
      walletPassword,
      walletID: rootXPRV.to_public().to_bech32().slice( 100 ),
      accountIndex: 0,
      // walletName: !walletName ? "wallet " + 0 : walletName,
      rootXPRV: await encrypt(walletPassword, rootXPRV.to_bech32()),
      rootXPUB: rootXPRV.to_public().to_bech32(),
      accountKeyPrv: await encrypt(walletPassword, accountKeyPrv.to_bech32()),
      accountKeyPub: accountAddressKeyPrv.to_public().to_bech32(),
      accountAddressKeyPrv: await encrypt(walletPassword, accountAddressKeyPrv.to_bech32()),
      accountAddressKeyPub: accountAddressKeyPrv.to_public().to_bech32(),
      accountStakeKeyPrv:  await encrypt(walletPassword, accountStakeKeyPrv.to_bech32()),
      accountStakeKeyPub: accountStakeKeyPrv.to_public().to_bech32(),
      baseAddress_bech32: baseAddress.to_address().to_bech32(),
      baseAddress_hex: baseAddress.to_address().to_hex(),
      stakeAddress: stakeAddress.to_address().to_bech32(),
    };
    console.log("new keys: ", newKeys);
    fs.writeFileSync('keys.json', JSON.stringify({ ...newKeys }, null, 2));
};

/*
##########################################################################################################
Parse stake address from base address
#############################d############################################################################
*/
export const convertAddressToStake = async ( address ) => {
  // use only if address is hashed
  // const addressBase = CSLwasm.Address.from_bytes(Buffer.from(address, "hex")).to_bech32();
  const stake_cred = CSLwasm.BaseAddress?.from_address(CSLwasm.Address.from_bech32(address))?.stake_cred();
  // console.log("stake cred", stake_cred);
  const reward_addr_bytes = new Uint8Array(29);
  reward_addr_bytes.set([0xe1], 0);
  reward_addr_bytes.set(stake_cred.to_bytes().slice(4, 32), 1);
  const reward_addr = CSLwasm.RewardAddress.from_address(CSLwasm.Address.from_bytes(reward_addr_bytes));
  // console.log("reward_addr", reward_addr);
  const stake_addr = reward_addr.to_address().to_bech32();
  // console.log("stake_addr", stake_addr);
  const stakePKH = Buffer.from(reward_addr_bytes).toString("hex").slice(2);
  // console.log("stakePKH", stakePKH);
  return(stake_addr);
};

/*
##########################################################################################################
DcSPark CarpApi
#############################d############################################################################
*/
export const CarpApi = async ( jsonRaw ) => {
  let settings= {};
  settings = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(jsonRaw),
    redirect: 'follow',
    mode: 'cors',
  };
  try {
    const fetchResponse = await fetch(`${carpServer}/metadata/nft`, settings);
    const data = await fetchResponse;
    if(data.status == "200") return(await data.json());
    // let carpHealth = { connection_status: "disconnected" }
    // sessionStorage.setItem("carpHealth", JSON.stringify(carpHealth));
    // return(JSON.stringify(carpHealth));
  } catch ( error ) {
    console.log("carp api error", error);
    return("error");
  };  
};

/*
##########################################################################################################
Take CIP25 metadata and convert it to JSON
#############################d############################################################################
*/
export const metadataCbortoJSON = async (cborString) => {
  // console.log("cborString", cborString);
  try{
    const metadataJSON = await decode(fromHex(cborString));
    // console.log("cborJson", metadataJSON);
    return(metadataJSON);
  }catch(error){
    console.log("cborJson Error", error)
    return(error);
  }
};

/*
##########################################################################################################
Take cardano POlicy.Asset and split into two parts
#############################d############################################################################
*/
export const splitAsset = ( asset ) => {
  return asset.split(".");
};

export const hex2a = (hexx) => {
  var hex = hexx.toString();//force conversion
  var str = '';
  for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  return str;
};

export const a2hex = ( ascii ) => {
    let arr1 = [];
  for (let n = 0, l = ascii.length; n < l; n ++) 
     {
    let hex = Number(ascii.charCodeAt(n)).toString(16);
    arr1.push(hex);
   }
  return arr1.join('');
};

export const fromHex = (hex) => {
    return Buffer.from(hex, "hex");
};

export const toHex = (bytes) => {
  return Buffer.from(bytes).toString('hex');
};

/*
##########################################################################################################
Take cardano current slot and calculate time left in epoch
#############################d############################################################################
*/
export const calculateEpochTimeLeft = async ( data ) => {
  // console.log("data", data);
  const timeLeftPercent = (data.slotInEpoch / 432000) * 100;
  const timeLeftSeconds = (432000 - data.slotInEpoch);
  const timeStats = {
    timeLeftPercent,
    timeLeftSeconds,
    timeHuman: seconds_to_days_hours_mins_secs_str(timeLeftSeconds)
  };
  console.log("timeStats", timeStats);
  return(timeStats);
};

export const seconds_to_days_hours_mins_secs_str = (seconds) => {
  // day, h, m and s
  var days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * (24 * 60 * 60);
  var hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * (60 * 60);
  var minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;
  return (0 < days ? days + " days, " : "") + hours + "h, " + minutes + "m, " + seconds + "s";
};
