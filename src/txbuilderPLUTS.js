import { TxBuilder, CborPositiveRational, defaultV1Costs, defaultV2Costs, ExBudget, Address, Certificate, CertificateType, Hash28, Hash32, PoolKeyHash, PoolParams, PubKeyHash, Script, ScriptType, StakeAddress, StakeCredentials, StakeValidatorHash, Tx, TxIn, TxMetadata, UTxO, Value, forceTxOutRefStr, isITxOut, isIUTxO} from "@harmoniclabs/plu-ts";
import { decrypt } from "./crypto.js";

/*
##########################################################################################################
Fetching ProtocolParams from Koios API V1
#############################d############################################################################
*/
const getProtocolParamsKoios = async () => {
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
    const fetchResponse = await fetch(`https://api.koios.rest/api/v1/epoch_params`, requestOptions);
    const data = await fetchResponse.json();
    // console.log(data);
    return(data);
  } catch (e) {
    console.log(e);
    return e;
  };
};

const constructKoiosProtocolParams = async ( protocolParamsKoiosRes ) => { 
  /*
  ##########################################################################################################
  Using current epoch protocol parmaters from Koios API V1 to create a new TxBuilder instance
  #############################d############################################################################
  */
  const defaultProtocolParameters = {
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
    protocolVersion: [ protocolParamsKoiosRes[0].protocol_major, protocolParamsKoiosRes[0].protocol_minor ],
    minPoolCost: Number(protocolParamsKoiosRes[0].min_pool_cost),
    utxoCostPerByte: Number(protocolParamsKoiosRes[0].coins_per_utxo_size),
    costModels: {
        PlutusScriptV1: protocolParamsKoiosRes[0].cost_models.PlutusV1,
        PlutusScriptV2: protocolParamsKoiosRes[0].cost_models.PlutusV2
    },
    executionUnitPrices: [
      new CborPositiveRational(protocolParamsKoiosRes[0].price_mem * 10000, 100), // mem
        // protocolParamsKoiosRes[0].price_mem * 100,
        new CborPositiveRational( protocolParamsKoiosRes[0].price_step* 10000000, 1e5 )  // cpu
    ],
    maxTxExecutionUnits: new ExBudget({ mem: protocolParamsKoiosRes[0].max_tx_ex_mem, cpu: protocolParamsKoiosRes[0].max_tx_ex_steps }),
    maxBlockExecutionUnits: new ExBudget({ mem: protocolParamsKoiosRes[0].max_block_ex_mem, cpu: protocolParamsKoiosRes[0].max_block_ex_steps }),
    maxValueSize: protocolParamsKoiosRes[0].max_val_size,
    collateralPercentage: protocolParamsKoiosRes[0].collateral_percent,
    maxCollateralInputs: protocolParamsKoiosRes[0].max_collateral_inputs,
  };

  return defaultProtocolParameters;
}

const testTxFunction = async () => {
  /*
  ##########################################################################################################
  Fetching ProtocolParams from Koios API V1
  #############################d############################################################################
  */
  const protocolParamsKoiosRes = await getProtocolParamsKoios();
  //console.log("protocolParamsKoiosRes", protocolParamsKoiosRes[0]);

  /*
  ##########################################################################################################
  Parse PraotocolParams from Koios API V1
  #############################d############################################################################
  */
  const defaultProtocolParameters = await constructKoiosProtocolParams( protocolParamsKoiosRes );

  /*
  ##########################################################################################################
  Constructing TxBuilder instance
  #############################d############################################################################
  */
  const txBuilder = new TxBuilder(
    defaultProtocolParameters
  )
  // console.log("txBuilder", txBuilder.protocolParamters);
  
  /*
  ##########################################################################################################
  CIP30 getUtxos() method CBORs
  #############################d############################################################################
  */
  let cbors = [
    "828258204b82398febd68fab512a56fd1786f05cc13ae2af706ebb9dc90502b499dfff010082583901130768a0e391b8c77be560580729ec927393e688991929129e609a4bb093f044b77f2fb13ce1828c954b1858ac9f76935e74e391c4255e72821a004c4b40a2581cb812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0a6494d616e64616c6123311864494d616e64616c6123321864494d616e64616c6123331864494d616e64616c6123341864494d616e64616c6123351864494d616e64616c6123361864581cb88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12aa8494d65726b61626123301864494d65726b61626123311864494d65726b61626123321864494d65726b61626123331864494d65726b616261233418644a4d65726b616261232d3118644a4d65726b616261232d3218644a4d65726b616261232d331864",
    "82825820ad7828a65ced5b48058230c88f1b420973bafa2fd546d5161cf008ab807624760082583901130768a0e391b8c77be560580729ec927393e688991929129e609a4bb093f044b77f2fb13ce1828c954b1858ac9f76935e74e391c4255e721a002dc6c0",
    "82825820ad7828a65ced5b48058230c88f1b420973bafa2fd546d5161cf008ab807624760182583901130768a0e391b8c77be560580729ec927393e688991929129e609a4bb093f044b77f2fb13ce1828c954b1858ac9f76935e74e391c4255e721a000eedc2",
    "828258205d8e75f465e9d7fc413bb03caf7a0b0d280b62d01bb9b853afbef8a25523ae820082583901130768a0e391b8c77be560580729ec927393e688991929129e609a4bb093f044b77f2fb13ce1828c954b1858ac9f76935e74e391c4255e721a002b1d8b"
  ];
  /*
  ##########################################################################################################
  Constructing UTxO instances from CBORs gathered through CIP30 getUtxos() method
  #############################d############################################################################
  */
  // const inputs = cbors.map( UTxO.fromCbor ); // UTxO[]
  // console.log("inputs", inputs);

  /*
  ##########################################################################################################
  Use when using UTXO info from other sources like Kupo indexer or BLockfrost
  #############################d############################################################################
  */
  let kupoRes = {
    "transaction_index": 17,
    "transaction_id": "f486c85056d208a423af09a96f3744746e304a77b7c61d955c3fe8afeb153473",
    "output_index": 0,
    "address": "addr1qyfsw69quwgm33mmu4s9spefajf88ylx3zv3j2gjnesf5jasj0cyfdml97cnecvz3j25kxzc4j0hdy67wn3er3p9teeq6ahdpn",
    "value": {
        "coins": 19789863,
        "assets": {
            "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612331": 100,
            "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612332": 100,
            "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612333": 100,
            "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612334": 100,
            "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612335": 100,
            "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612336": 100,
            "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d31": 100,
            "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d32": 100,
            "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d33": 100,
            "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b6162612330": 100,
            "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b6162612331": 100,
            "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b6162612332": 100,
            "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b6162612333": 100,
            "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b6162612334": 100
        }
    },
    "datum_hash": null,
    "script_hash": null,
    "created_at": {
        "slot_no": 116913644,
        "header_hash": "5c252917fe7f8e1d57fd65f2287349509f379df5816e881f8583e16d6a75b1a7"
    },
    "spent_at": null
  };

  const inputs = new UTxO({
    utxoRef: {
      id:  kupoRes.transaction_id,
      index: kupoRes.output_index
    },
    resolved: {
      address: Address.fromString( kupoRes.address ),
      value: [], // parse kupo value
      datum: [], // parse kupo datum 
      refScript: "" // look for ref script if any
    }
  });
  

  /*
  ##########################################################################################################
  Change address: address that will receive whats left over from spent UTXOS.
  #############################d############################################################################
  */
  const changeAddress ="addr1qyfsw69quwgm33mmu4s9spefajf88ylx3zv3j2gjnesf5jasj0cyfdml97cnecvz3j25kxzc4j0hdy67wn3er3p9teeq6ahdpn";
  // console.log("changeAddress", changeAddress);
  
  /*
  ##########################################################################################################
  receiving Address: address that will receive the goods.
  #############################d############################################################################
  */
  const receivingAddress ="addr1qyfsw69quwgm33mmu4s9spefajf88ylx3zv3j2gjnesf5jasj0cyfdml97cnecvz3j25kxzc4j0hdy67wn3er3p9teeq6ahdpn";
  
  /*
  ##########################################################################################################
  Creating outputs for receiving address
  #############################d############################################################################
  */
  const outputs = new UTxO({
    resolved: {
      address: Address.fromString( receivingAddress ),
      value:  [ Value.lovelaces(2000000) ], // parse kupo value
      datum: [], // parse kupo datum 
      refScript: "" // look for ref script if any
    }
  });
  console.log("outputs", outputs);

  try{
    txBuilder.buildSync({inputs, changeAddress, outputs});
  }catch( error ){
    console.log("txBuilder.buildSync", error);
  } 

};

testTxFunction();