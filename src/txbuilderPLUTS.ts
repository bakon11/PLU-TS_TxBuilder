import {
  TxBuilder,
  CborPositiveRational,
  defaultV1Costs,
  defaultV2Costs,
  ExBudget,
  Address,
  Certificate,
  CertificateType,
  Hash28,
  Hash32,
  PoolKeyHash,
  PoolParams,
  PubKeyHash,
  Script,
  ScriptType,
  StakeAddress,
  StakeCredentials,
  StakeValidatorHash,
  Tx,
  TxIn,
  TxMetadata,
  UTxO,
  Value,
  forceTxOutRefStr,
  isITxOut,
  isIUTxO,
  ITxBuildInput,
  TxOut,
} from "@harmoniclabs/plu-ts";
import { decrypt, encrypt } from "./crypto";
import { koiosAPI, kupoAPI, genKeys, a2hex, splitAsset, fromHexString, fromHex } from "./utils.ts";
import * as fs from "fs";
import { Datum } from "@dcspark/cardano-multiplatform-lib-nodejs";

const constructKoiosProtocolParams = async (protocolParamsKoiosRes: any) => {
  /*
  ##########################################################################################################
  Using current epoch protocol parmaters from Koios API V1 to create a new TxBuilder instance
  #############################d############################################################################
  */
  const defaultProtocolParameters: any = {
    txFeePerByte: protocolParamsKoiosRes[0].min_fee_a,
    txFeeFixed: protocolParamsKoiosRes[0].min_fee_b,
    maxBlockBodySize: protocolParamsKoiosRes[0].max_block_size,
    maxTxSize: protocolParamsKoiosRes[0].max_tx_size,
    maxBlockHeaderSize: protocolParamsKoiosRes[0].max_bh_size,
    stakeAddressDeposit: Number(protocolParamsKoiosRes[0].key_deposit),
    stakePoolDeposit: Number(protocolParamsKoiosRes[0].pool_deposit),
    poolRetireMaxEpoch: protocolParamsKoiosRes[0].max_epoch,
    stakePoolTargetNum: protocolParamsKoiosRes[0].optimal_pool_count,
    poolPledgeInfluence: protocolParamsKoiosRes[0].influence,
    monetaryExpansion: protocolParamsKoiosRes[0].monetary_expand_rate,
    treasuryCut: protocolParamsKoiosRes[0].treasury_growth_rate,
    protocolVersion: [protocolParamsKoiosRes[0].protocol_major, protocolParamsKoiosRes[0].protocol_minor],
    minPoolCost: Number(protocolParamsKoiosRes[0].min_pool_cost),
    utxoCostPerByte: Number(protocolParamsKoiosRes[0].coins_per_utxo_size),
    costModels: {
      PlutusScriptV1: protocolParamsKoiosRes[0].cost_models.PlutusV1,
      PlutusScriptV2: protocolParamsKoiosRes[0].cost_models.PlutusV2,
    },
    executionUnitPrices: [
      new CborPositiveRational(protocolParamsKoiosRes[0].price_mem * 10000, 100), // mem
      // protocolParamsKoiosRes[0].price_mem * 100,
      new CborPositiveRational(protocolParamsKoiosRes[0].price_step * 10000000, 1e5), // cpu
    ],
    maxTxExecutionUnits: new ExBudget({ mem: protocolParamsKoiosRes[0].max_tx_ex_mem, cpu: protocolParamsKoiosRes[0].max_tx_ex_steps }),
    maxBlockExecutionUnits: new ExBudget({ mem: protocolParamsKoiosRes[0].max_block_ex_mem, cpu: protocolParamsKoiosRes[0].max_block_ex_steps }),
    maxValueSize: protocolParamsKoiosRes[0].max_val_size,
    collateralPercentage: protocolParamsKoiosRes[0].collateral_percent,
    maxCollateralInputs: protocolParamsKoiosRes[0].max_collateral_inputs,
  };

  return defaultProtocolParameters;
};

const testTxFunction = async () => {
  /*
  ##########################################################################################################
  Keys.json file contianing all addresses and encrypted private keys, created with the genKeys() function.
  Look at example keysExample.json file
  #############################d############################################################################
  */
  let keys = fs.readFileSync("keys.json", "utf8");

  /*
  ##########################################################################################################
  Fetching ProtocolParams from Koios API V1
  #############################d############################################################################
  */
  const protocolParamsKoiosRes = await koiosAPI("epoch_params");
  //console.log("protocolParamsKoiosRes", protocolParamsKoiosRes[0]);

  /*
  ##########################################################################################################
  Parse PraotocolParams from Koios API V1
  #############################d############################################################################
  */
  const defaultProtocolParameters = await constructKoiosProtocolParams(protocolParamsKoiosRes);

  /*
  ##########################################################################################################
  Constructing TxBuilder instance
  #############################d############################################################################
  */
  const txBuilder = new TxBuilder(defaultProtocolParameters);
  // console.log("txBuilder", txBuilder.protocolParamters);

  /*
  ##########################################################################################################
  CIP30 getUtxos() method CBORs example for now.
  ##########################################################################################################
  */
  let cbors = [
    "828258201c9be6d02e59e5f944eb630fdd5fcf26c5a17f8c03ebd5bcf32e6c8e008310890182583901130768a0e391b8c77be560580729ec927393e688991929129e609a4bb093f044b77f2fb13ce1828c954b1858ac9f76935e74e391c4255e721a00114a4c",
    "82825820f486c85056d208a423af09a96f3744746e304a77b7c61d955c3fe8afeb1534730082583901130768a0e391b8c77be560580729ec927393e688991929129e609a4bb093f044b77f2fb13ce1828c954b1858ac9f76935e74e391c4255e72821a012df827a2581cb812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0a6494d616e64616c6123311864494d616e64616c6123321864494d616e64616c6123331864494d616e64616c6123341864494d616e64616c6123351864494d616e64616c6123361864581cb88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12aa8494d65726b61626123301864494d65726b61626123311864494d65726b61626123321864494d65726b61626123331864494d65726b616261233418644a4d65726b616261232d3118644a4d65726b616261232d3218644a4d65726b616261232d331864",
  ];

  /*
  ##########################################################################################################
  Constructing UTxO instances from CBORs gathered through CIP30 getUtxos() method
  #############################d############################################################################
  */
  const inputsCbor: any = cbors.map(UTxO.fromCbor); // UTxO[]
  // console.log("inputs", inputsCbor);
  const inputsCborParsed = inputsCbor.map((utxo: any) => ({ utxo: utxo }));
  // console.log("inputsCborParsed", inputsCborParsed[1].utxo.resolved.value.lovelaces);
  /*
  ##########################################################################################################
  Use when using UTXO info from other sources like Kupo indexer or BLockfrost
  #############################d############################################################################
  */
  let kupoRes: any = await kupoAPI(`matches/${JSON.parse(keys).baseAddress_bech32}?unspent`);
  // console.log("kupoRes", kupoRes[0]);

  // for now will just pick first utxo object from array
  let kupoAssets: any;
  // kupoAssets = Value.singleAsset( new Hash28("<hosky policy>"), fromAscii("HOSKY"), 1_000_000_000 )
  Object.entries(kupoRes[0].value).map(([key, value]: any) => {
    key === "coins" && Value.add(Value.lovelaces(kupoRes[0].value.coins), kupoAssets);
    key === "assets" &&
      Object.entries(value).map(([asset, quantity]: any) => {
        let newAsset = Value.singleAsset(new Hash28(splitAsset(asset)[0]), fromHex(splitAsset(asset)[1]), quantity);
        Value.add(newAsset, kupoAssets);
      });
  });
  console.log("kupoAssets", kupoAssets);

  const inputsKupo: any = new UTxO({
    utxoRef: {
      id: kupoRes[0].transaction_id,
      index: kupoRes[0].output_index,
    },
    resolved: {
      address: Address.fromString(kupoRes[0].address),
      value: kupoAssets,

      // Value.lovelaces(kupoRes[0].value.coins), // parse kupo
      // datum: [], // parse kupo datum
      // refScript: [] // look for ref script if any
    },
  });
  // console.log("utxoInputs", utxo);

  const inputsKupoArray: any = [inputsKupo];
  const inputsKupoParsed = inputsKupoArray.map((utxo: any) => ({ utxo: utxo }));
  // console.log("inputsKupoParsed", inputsKupoParsed[0].utxo.resolved.value);
  /*
  ##########################################################################################################
  Change address: address that will receive whats left over from spent UTXOS.
  #############################d############################################################################
  */
  const changeAddress = JSON.parse(keys).baseAddress_bech32;
  // console.log("changeAddress", changeAddress);

  /*
  ##########################################################################################################
  receiving Address: address that will receive the goods.
  #############################d############################################################################
  */
  const receivingAddress = "addr1q9shhjkju8aw2fpt4ttdnzrqcdacaegpglfezen33kq9l2wcdqua0w5yj7d8thpulynjly2yrhwxvdhtrxqjpmy60uqs4h7cyp";

  /*
  ##########################################################################################################
  Creating outputs for receiving address
  #############################d############################################################################
  */
  const outputs: any = new TxOut({
    address: Address.fromString(receivingAddress),
    value: Value.lovelaces(1000000), // parse kupo value
    // datum: [], // parse kupo datum
    // refScript: [] // look for ref script if any
  });
  // console.log("outputs", outputs);
  // console.log("address",  Address.fromString( kupoRes[0].address))
  const outputsArray: any = [outputs];
  try {
    txBuilder.buildSync({ inputs: inputsKupoParsed, changeAddress, outputs: outputsArray });

    // console.log("txBuilder", txBuilder);
  } catch (error) {
    console.log("txBuilder.buildSync", error);
  }
};

testTxFunction();

/*
where you see "entry" in the name generates a value for the array
if it has no "entry" it generates a value only with that entry
exapmple 

the Value class has an add static method
so you just do Value.add( assets1, assets2)
and you have a new Value instance

export class Value {
    // lots of stuff here ...

    static lovelaceEntry( n: CanBeUInteger ): IValueAdaEntry
    {
        return {
            policy: "",
            assets: [
                {
                    name: new Uint8Array([]),
                    quantity: typeof n === "number" ? Math.round( n ) : BigInt( n ) 
                }
            ]
        };
    }

    static lovelaces( n: number | bigint ): Value
    {
        return new Value([ Value.lovelaceEntry(n) ]);
    }

    static assetEntry(
        name: Uint8Array,
        qty: number | bigint
    ): IValueAsset
    {
        if(!(
            name instanceof Uint8Array &&
            name.length <= 32
        )) throw new Error("invalid asset name; must be Uint8Array of length <= 32");
        return {
            name: name.slice(),
            quantity: typeof qty === "number" ? Math.round( qty ) : BigInt( qty ) 
        };
    }

    static singleAssetEntry(
        policy: Hash28,
        name: Uint8Array,
        qty: number | bigint
    ): IValuePolicyEntry
    {
        return {
            policy,
            assets: [ Value.assetEntry( name, qty ) ]
        };
    }

    static singleAsset(
        policy: Hash28,
        name: Uint8Array,
        qty: number | bigint
    ): Value
    {
        return new Value([
            Value.singleAssetEntry(
                policy,
                name,
                qty
            )
        ]);
    }

    static entry(
        policy: Hash28,
        assets: IValueAssets
    ): IValuePolicyEntry
    {
        return { policy, assets };
    }
}
*/
