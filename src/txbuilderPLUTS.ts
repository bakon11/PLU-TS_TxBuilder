// import { TxBuilder, Address, Hash28, Hash, UTxO, Value, TxOut, VKeyWitness, VKey } from "@harmoniclabs/plu-ts";
import * as pluts from "@harmoniclabs/plu-ts";
import {  splitAsset, fromHex } from "./utils.ts";

export const txBuilder_PLUTS: any = async ( protocolParameters: any, utxoInputsKupo: any, utxoInputsCBOR: any, utxoOutputs: any, changeAddress: any, accountAddressKeyPrv: any) => {
  // console.log(protocolParameters);
  // console.log(utxoInputs[0].value);
  // console.log(utxoInputsCBOR);
  // console.log(utxoOutputs);
  // console.log(changeAddress);

  /*
  ##########################################################################################################
  Constructing TxBuilder instance
  #############################d############################################################################
  */
  const txBuilder = new pluts.TxBuilder(protocolParameters);
  // console.log("txBuilder", txBuilder.protocolParamters);

  /*
  ##########################################################################################################
  Constructing UTxO instances from CBORs gathered through CIP30 getUtxos() method
  #############################d############################################################################
  */
  const inputsCbor: any = utxoInputsCBOR.map(pluts.UTxO.fromCbor); // UTxO[]
  // console.log("inputs", inputsCbor);
  const inputsCborParsed = inputsCbor.map((utxo: any) => ({ utxo: utxo }));
  // console.log("inputsCborParsed", inputsCborParsed[1].utxo.resolved.value.lovelaces);

  /*
  ##########################################################################################################
  Generate inputs from utxoInputsKupo
  #############################d############################################################################
  */
  let inputs: any = [];
  Promise.all(
    await utxoInputsKupo.map(async (utxo: any) => {
      // console.log("adding inputs")
      inputs.push( new pluts.UTxO({
        utxoRef: {
          id: utxo.transaction_id,
          index:utxo.output_index,
        },
        resolved: {
          address: pluts.Address.fromString(utxo.address),
          value: await createInputValuesKupo(utxo),
          // datum: [], // parse kupo datum
          // refScript: [] // look for ref script if any
        },
      }));
      // console.log("address used", pluts.Address.fromString(utxo.address).paymentCreds)
    })
  );
  const inputsKupoParsed = inputs.map((utxo: any) => ({ utxo: utxo }));
  // console.log("inputsKupoParsed", inputsKupoParsed);

  /*
  ##########################################################################################################
  Creating outputs for receiving address
  #############################d############################################################################
  */
  let outputsParsed: pluts.TxOut[] = []; 
  Promise.all(  
    await utxoOutputs.map(async (output: any ) => {
      outputsParsed.push(new pluts.TxOut({
        address: pluts.Address.fromString(output.address),
        value: await createOutputValues(output), // parse kupo value
        // datum: [], // parse kupo datum
        // refScript: [] // look for ref script if any
      }));
    })
  );
  console.log("outputsParsed", outputsParsed[1].toCbor().toString());

  let minUtxoCost = txBuilder.getMinimumOutputLovelaces( outputsParsed[1].toCbor().toString());
  console.log("minUtxoCost", minUtxoCost);

  const metadataJson: any = {
    label: 420,
    message: "Hello World"
  };

  const txMetadata = pluts.jsonToMetadata(metadataJson, false);
  console.log("txMetadata", txMetadata);


  /*
  ##########################################################################################################
  Transaction time to live till after slot?
  #############################d############################################################################
  */
  const ttl = 500000000;

  try {
    let builtTx = txBuilder.buildSync({ inputs: inputsKupoParsed, changeAddress, outputs: outputsParsed, invalidAfter: ttl});   
    // Sign tx hash
    const signedTx = accountAddressKeyPrv.sign(builtTx.body.hash.toBuffer());
    // console.log("txBuffer", builtTx.body.hash.toBuffer());
    
    const VKeyWitness = new pluts.VKeyWitness(new pluts.VKey(signedTx.pubKey), new pluts.Signature(signedTx.signature));
    // console.log("VKeyWitness", VKeyWitness);
    builtTx.witnesses.addVKeyWitness(VKeyWitness);
    const txCBOR = builtTx.toCbor().toString();
    console.log("builtTx", builtTx);
    console.log("txCBOR", txCBOR);
    // console.log("builtTx hash: ", builtTx.hash);
    console.log("builtTx complete: ", builtTx.isComplete);
  } catch (error) {
    console.log("txBuilder.buildSync", error);
  };
};

/*
##########################################################################################################
This function will create UTXO input values like: UTXO lovelaces and UTXO assets for PLU-TS
#############################d############################################################################
*/
const createInputValuesKupo = async (kupoUtxo: any) => {
  // console.log("kupoUtxo", kupoUtxo);
  // for now will just pick first utxo object from array
  let kupoAssets: any = [];
  Promise.all(
    Object.entries(kupoUtxo.value).map(([key, value]: any) => {
      // console.log("key", key);
      // console.log("value", value);
      key === "coins" && ( kupoAssets.push( pluts.Value.lovelaces(kupoUtxo.value.coins)));
      key === "assets" &&  Object.entries(value).length > 0 &&
        Object.entries(value).map(([asset, quantity]: any) => {    
          let assetNew = pluts.Value.singleAsset(new pluts.Hash28(splitAsset(asset)[0]), fromHex(splitAsset(asset)[1]), quantity)
          kupoAssets.push(assetNew);
        });
    })
  );
  // console.log("kupoAssets", kupoAssets);
  return( kupoAssets.reduce(pluts.Value.add));
};

/*
##########################################################################################################
This function will create UTXO outputs meaning sending to someone from following Object
{
  address: "addr1q9shhjkju8aw2fpt4ttdnzrqcdacaegpglfezen33kq9l2wcdqua0w5yj7d8thpulynjly2yrhwxvdhtrxqjpmy60uqs4h7cyp",
  value: {
    coins: 1000000,
    assets: {
      "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d33": 1,
      "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d32": 1,
      "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612332": 1,
      "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612331": 1
    }
  }
}
#############################d############################################################################
*/
const createOutputValues = async ( output: any) => {
  // console.log("output", output);
  let outputAssets: any = [];
  const minUtxo = calcMinUtxo(output.value.assets);
  Promise.all(
    Object.entries(output.value).map(([key, value]: any) => {
      // console.log("key", key);
      // console.log("value", value);
      key === "coins" && ( outputAssets.push( pluts.Value.lovelaces(output.value.coins + minUtxo)));
      key === "assets" &&  Object.entries(value).length > 0 &&
        Object.entries(value).map(([asset, quantity]: any) => {    
          let assetNew = pluts.Value.singleAsset(new pluts.Hash28(splitAsset(asset)[0]), fromHex(splitAsset(asset)[1]), quantity)
          outputAssets.push(assetNew);
        });
    })
  );
  return( outputAssets.reduce(pluts.Value.add));
};

const calcMinUtxo = (assets: any) => {
  // console.log("assets", assets)
  const minutxo = (Object.entries(assets).length * 116200);
  return(minutxo);
};

/*
In order to get transaction id using cardano-serialization-lib you should convert transaction id to bytes and convert them to hex string.

Buffer.from(utxo.input().transaction_id().to_bytes()).toString('hex')
*/

/*
We can convert the addr_test1grqe6lg9ay8wkcu5k5e38lne63c80h3nq6xxhqfmhewf645pllllllllllll7lupllllllllllll7lupllllllllllll7lc9wayvj bech32 to hex using the following code:

// this function was copied from the bech32 package
function convert(data, inBits, outBits, pad) {
  let value = 0;
  let bits = 0;
  const maxV = (1 << outBits) - 1;
  const result = [];
  for (let i = 0; i < data.length; ++i) {
      value = (value << inBits) | data[i];
      bits += inBits;
      while (bits >= outBits) {
          bits -= outBits;
          result.push((value >> bits) & maxV);
      }
  }
  if (pad) {
      if (bits > 0) {
          result.push((value << (outBits - bits)) & maxV);
      }
  }
  else {
      if (bits >= inBits)
          return 'Excess padding';
      if ((value << (outBits - bits)) & maxV)
          return 'Non-zero padding';
  }
  return result;
}
const decoded = bech32.decode('addr_test1grqe6lg9ay8wkcu5k5e38lne63c80h3nq6xxhqfmhewf645pllllllllllll7lupllllllllllll7lupllllllllllll7lc9wayvj', 111);
const base16 = convert(decoded.words, 5, 8, false);
const hexAddress = Buffer.from(base16);
console.log(hexAddress.toString('hex'));
*/