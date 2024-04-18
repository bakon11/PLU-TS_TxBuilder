import * as fs from "node:fs";
import { koiosAPI, kupoAPI, constructKoiosProtocolParams } from "./utils.ts";
import { genSeedPhrase, seedPhraseToEntropy, genRootPrivateKey, genAccountPrivatekey, genAddressPrivatekey } from "./cryptoPLUTS.ts"
import { txBuilder_PLUTS } from "./txbuilderPLUTS.ts";
import * as pluts from "@harmoniclabs/plu-ts";
// import { blake2b_224 } from "@harmoniclabs/crypto";
import * as plutsBip from "@harmoniclabs/bip32_ed25519";
import { decrypt } from "./cryptoPLUTS.ts";

const buildTx = async ( ) => {
    const changeAddress = "addr1q9shhjkju8aw2fpt4ttdnzrqcdacaegpglfezen33kq9l2wcdqua0w5yj7d8thpulynjly2yrhwxvdhtrxqjpmy60uqs4h7cyp"  
  /*
  ##########################################################################################################
  Fetching ProtocolParams from Koios API V1
  #############################d############################################################################
  */
  const protocolParamsKoiosRes = await koiosAPI("epoch_params");
  // console.log("protocolParamsKoiosRes", protocolParamsKoiosRes[0]);
  
  /*
  ##########################################################################################################
  Parse PraotocolParams from Ogmios
  #############################d############################################################################
  */
  // const ogmiosHealthRes = await ogmiosHealth();
  // console.log("ogmiosHealthRes", ogmiosHealthRes);

  /*
  ##########################################################################################################
  Parse PraotocolParams from Koios API V1
  #############################d############################################################################
  */
  const defaultProtocolParameters = await constructKoiosProtocolParams(protocolParamsKoiosRes);
  // console.log("defaultProtocolParameters", defaultProtocolParameters);

  /*
  ##########################################################################################################
  CIP30 getUtxos() method CBORs example for now.
  ##########################################################################################################
  */
  let cborInputs: any = [];
  
  /*
  ##########################################################################################################
  Use when using UTXO info from other sources like Kupo indexer or BLockfrost
  #############################d############################################################################
  */
  let kupoInputs = await kupoAPI(`matches/${changeAddress}?unspent`);
  // console.log("kupoInputs", kupoInputs);

  /*
  ##########################################################################################################
  Output utxos
  #############################d############################################################################
  */
  const utxoOutputs = [
    {
      address: "addr1q9shhjkju8aw2fpt4ttdnzrqcdacaegpglfezen33kq9l2wcdqua0w5yj7d8thpulynjly2yrhwxvdhtrxqjpmy60uqs4h7cyp",
      value: {
        coins: 1000000,
        assets: {
          "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d33": 1,
          "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d32": 1,
          "b88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12a.4d65726b616261232d31": 1,
          "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612332": 1,
          "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612331": 1,
          "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612333": 1,
          "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612334": 1
        }
      }
    }
    ,{
      address: "addr1q9shhjkju8aw2fpt4ttdnzrqcdacaegpglfezen33kq9l2wcdqua0w5yj7d8thpulynjly2yrhwxvdhtrxqjpmy60uqs4h7cyp",
      value: {
        coins: 1000000,
        assets: {
        }
      }
    }
  ];

  /*
  ##########################################################################################################
  Metadata to include with teh TX.
  #############################d############################################################################
  */
  const metadata = {
    label: 420,
    properties: {
        type: "mandala_rewards_despensing",
        message: "Another sovereing has claimed their story.",
        website: "https://www.enterthemandala.com/",
        message2: "TX Crafted With PLU-TS"
    }
  };

 
  await txBuilder_PLUTS(defaultProtocolParameters, kupoInputs, cborInputs, utxoOutputs, changeAddress, metadata);
};