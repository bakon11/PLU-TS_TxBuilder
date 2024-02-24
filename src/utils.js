import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fetch from 'node-fetch';
import https from "https";
import http from "http";
// import * as CSLwasm from "@emurgo/cardano-serialization-lib-nodejs";
import * as CSLwasm from "@dcspark/cardano-multiplatform-lib-nodejs";
import MandalaClanAppBackend from "mandala-clan-app-client";
import { decode } from 'cbor-x';
import { Buffer } from 'node:buffer';
const mandaladb = "../server/typescript/db/mandala.db";
const type = "http";
const ogmiosServer = "192.168.8.2";
const ogmiosPort = 1337;
const kupoServer = "192.168.8.3";
const kupoPort = 1442;
const carpServer = "http://192.168.8.2:3000";


//const ogmiosServer = "ogmios.bakon.dev";
//const ogmiosPort = 443;
//const kupoServer = "kupo.bakon.dev"
//const kupoPort = 443;
const alchemyApi = "IC_ntRsmFeKPzCI82CrPouCWmiDp-JNe"


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

export const getChainStats = async () => {
  let agent;
  type === "http" ? agent = new http.Agent({rejectUnauthorized: false}) : agent = new https.Agent({rejectUnauthorized: false});
  let data;
  const queryOgmiosRes = await fetch(`${type}://${ogmiosServer}:${ogmiosPort}/health`, { agent });
  // console.log("queryOgmiosRes", queryOgmiosRes);
  if (queryOgmiosRes.ok) {
    data = await queryOgmiosRes.json();
  };
  // console.log(data);
  return(data);
};

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

export const kupoAPI = async ( uri ) => {
  let settings= {};
  settings = {
    method: "GET",
    headers: {},
    redirect: "follow"
  };
  try {
    const fetchResponse = await fetch(`${type}://${kupoServer}:${kupoPort}/${uri}`, settings);
    const data = await fetchResponse.json();
    // console.log(data);
    return(data);
  } catch (e) {
    console.log(e);
    return e;
  };
};

export const alchemyApiGet = async ( uri ) => {
    let settings= {};
    settings = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: 'follow',
      mode: 'cors',
    };
    try {
      const fetchResponse = await fetch(`https://eth-mainnet.g.alchemy.com/nft/v2/${alchemyApi}/${uri}`, settings);
      const data = await fetchResponse.json();
      //console.log(data);
      return(data);
    } catch (e) {
      console.log(e);
      return e;
    };  
};

export const alchemyApiGet1 = async ( uri ) => {
    let settings= {};
    settings = {
      method: "GET",
    };
    try {
      const fetchResponse = await fetch(`https://eth-mainnet.g.alchemy.com/nft/v2/${alchemyApi}/${uri}`, settings);
      const data = await fetchResponse;
      // console.log(data);
      // data.status == "200" && console.log(await data.json());
      if(data.status == "200") return(await data.json());
    } catch (e) {
      // console.log(e);
      return e;
    };  
};

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

export const mandalaAPI = async ( method, params ) => {
  console.log(params)
  var raw = JSON.stringify({
    "jsonrpc": "2.0",
    method,
    params: [...params],
    "id": 2
  });

  let settings= {};
  settings = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: raw,
    redirect: 'follow',
    mode: 'cors',
  };  

  try {
    const fetchResponse = await fetch("http://192.168.8.20:4441", settings);
    const data = await fetchResponse;
    // console.log(data);
    // data.status == "200" && console.log(await data.json());
    if(data.status == "200") return(await data.json());
  } catch ( error ) {
    console.log("mandala api error", error);
    return(error);
  };
};

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