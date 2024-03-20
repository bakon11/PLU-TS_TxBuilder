import * as fs from "fs";
// import { TxBuilder, Address, Hash32, Hash28, Hash, UTxO, Value, TxOut, VKeyWitness, VKey, PrivateKey  } from "@harmoniclabs/plu-ts";
import { koiosAPI, kupoAPI, genKeys, a2hex, splitAsset, fromHexString, fromHex, toHex, hex2a, constructKoiosProtocolParams, ogmiosHealth } from "./utils.ts";
import { genSeedPhrase, seedPhraseToEntropy, genRootPrivateKey, genAccountPrivatekey, genAddressPrivatekey} from "./cryptoNew.ts"
import { txBuilder_PLUTS } from "./txbuilderPLUTS.ts";
import * as pluts from "@harmoniclabs/plu-ts";
import { blake2b_224 } from "@harmoniclabs/crypto";

const buildTx = async () => {
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
  // console.log("protocolParamsKoiosRes", protocolParamsKoiosRes[0]);
  
  /*
  ##########################################################################################################
  Parse PraotocolParams from Koios API V1
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

  /*
  ##########################################################################################################
  CIP30 getUtxos() method CBORs example for now.
  ##########################################################################################################
  */
  let cborInputs = [
    "828258201c9be6d02e59e5f944eb630fdd5fcf26c5a17f8c03ebd5bcf32e6c8e008310890182583901130768a0e391b8c77be560580729ec927393e688991929129e609a4bb093f044b77f2fb13ce1828c954b1858ac9f76935e74e391c4255e721a00114a4c",
    "82825820f486c85056d208a423af09a96f3744746e304a77b7c61d955c3fe8afeb1534730082583901130768a0e391b8c77be560580729ec927393e688991929129e609a4bb093f044b77f2fb13ce1828c954b1858ac9f76935e74e391c4255e72821a012df827a2581cb812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0a6494d616e64616c6123311864494d616e64616c6123321864494d616e64616c6123331864494d616e64616c6123341864494d616e64616c6123351864494d616e64616c6123361864581cb88d9fe270b184cf02c99b19ffa5ab0181daeff00c52811c6511c12aa8494d65726b61626123301864494d65726b61626123311864494d65726b61626123321864494d65726b61626123331864494d65726b616261233418644a4d65726b616261232d3118644a4d65726b616261232d3218644a4d65726b616261232d331864",
  ]; 
  
  /*
  ##########################################################################################################
  Use when using UTXO info from other sources like Kupo indexer or BLockfrost
  #############################d############################################################################
  */
  const inputAddress = "addr1qyfsw69quwgm33mmu4s9spefajf88ylx3zv3j2gjnesf5jasj0cyfdml97cnecvz3j25kxzc4j0hdy67wn3er3p9teeq6ahdpn";
  let kupoInputs: any = await kupoAPI(`matches/${inputAddress}?unspent`);
  // let kupoInputs: any = await kupoAPI(`matches/${JSON.parse(keys).baseAddress_bech32}?unspent`);
  // console.log("kupoInputs", kupoInputs);

  /*
  ##########################################################################################################
  Change address: address that will receive whats left over from spent UTXOS.
  #############################d############################################################################
  */
  const changeAddress = JSON.parse(keys).baseAddress_bech32;
  // console.log("changeAddress", changeAddress);

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
          "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612332": 1
        }
      }
    }
  ];

  /*
  ##########################################################################################################
  For example purposes will regenerate keys from seed and entropy contained in the keys.json file.
  (check keys.json.ecample file for reference)
  However this is not secure and will be corrected in the future.
  #############################d############################################################################
  */
 
  //  genRootPrivateKeyNew, genAccountPrivatekeyNew, genAddressPrivatekeyNew, genAddressPubKeyNew
  // const rootXPRV: any = await decrypt( JSON.parse(keys).walletPassword ,JSON.parse(keys).rootXPRV);
  // console.log("rootXPRV", JSON.parse(rootXPRV));
  
  const entropy = await seedPhraseToEntropy(JSON.parse(keys).seedPhrase);
  // console.log("entropy", entropy);

  const rootKey = await genRootPrivateKey(entropy);
  //console.log("rootKey: ", rootKey);

  const accountKeyPrv = await genAccountPrivatekey(rootKey, 0);
  // console.log("accountKeyPrv", accountKeyPrv);

  const accountAddressKeyPrv = await genAddressPrivatekey(accountKeyPrv, 0, 0)
  // console.log("accountAddressKeyPrv", accountAddressKeyPrv);

  const accountAddressKeyPub = accountAddressKeyPrv.public();
  console.log("accountAddress Key Hash from @harmoniclabs/bip32_ed25519 ", toHex( blake2b_224(accountAddressKeyPub.toPubKeyBytes())));
  console.log("input address hash", pluts.Address.fromString(inputAddress).paymentCreds.hash.toString())

  await txBuilder_PLUTS(defaultProtocolParameters, kupoInputs, cborInputs, utxoOutputs, changeAddress, accountAddressKeyPrv);
};

buildTx();


// genKeys();