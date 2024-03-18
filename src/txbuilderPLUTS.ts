// import { TxBuilder, Address, Hash28, Hash, UTxO, Value, TxOut, VKeyWitness, VKey } from "@harmoniclabs/plu-ts";
import * as pluts from "@harmoniclabs/plu-ts";
import { koiosAPI, kupoAPI, genKeys, a2hex, splitAsset, fromHexString, fromHex, toHex } from "./utils.ts";
import { builtinModules } from "module";

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
          value: await createInputValues(utxo),
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
  let outputsParsed: any = [];
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
  // console.log("outputsParsed", outputsParsed);

  /*
  ##########################################################################################################
  Transaction time to live till after slot?
  #############################d############################################################################
  */
  const ttl = 500000000;

  try {
    let builtTx = txBuilder.buildSync({ inputs: inputsKupoParsed, changeAddress, outputs: outputsParsed, invalidAfter: ttl});
    // console.log("builtTx", builtTx.hash);
    // console.log("builtTx fee", builtTx.body.outputs[0].value.lovelaces);
    // console.log("builtHash", builtTx.hash);
    // console.log("minUtxo", txBuilder.getMinimumOutputLovelaces( builtTx.hash));
    
    // Sign tx hash
    const signedTx = accountAddressKeyPrv.sign(builtTx.hash.toCbor());
    // console.log("signedTx", signedTx);

    // add tx vkeys
    // builtTx.addVKeyWitness(new pluts.VKeyWitness(new pluts.VKey(signedTx.pubKey), new pluts.Signature(signedTx.signature)));
    builtTx.addVKeyWitness(new pluts.VKeyWitness(new pluts.VKey(signedTx.pubKey), new pluts.Signature(signedTx.signature)));

    const txCBOR = builtTx.toCbor().toString();
    console.log("txCBOR", txCBOR);
    console.log("builtTx", builtTx.hash);
    console.log("builtTx complete: ", builtTx.isComplete);

  } catch (error) {
    console.log("txBuilder.buildSync", error);
  };
};

// tx.hash.toCbor().toBuffer()
// tx.hash.toCbor().toString()
// const txHex = await Buffer.from(transaction.to_bytes()).toString("hex");
// const encodedSignedTx = Buffer.from(txSigned.to_bytes()).toString("hex");
// console.log("encodedSignedTx", encodedSignedTx);

/*
( signer: PrivateKey ): void => {
    const [ derivedPubKey, signature ] = signEd25519( this.body.hash.toBuffer(), signer.toBuffer() );

    this.addVKeyWitness(
        new VKeyWitness(
            new VKey( derivedPubKey ),
            new Signature( signature )
        )
    );
}
*/

/*
##########################################################################################################
This function will create UTXO input values like: UTXO lovelaces and UTXO assets for PLU-TS
#############################d############################################################################
*/
const createInputValues = async (kupoUtxo: any) => {
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
      "b812d5a466604bcc25d2313183c387cebf52302738b5a178daf146f0.4d616e64616c612332": 1
    }
  }
}
#############################d############################################################################
*/
const createOutputValues = async (output: any) => {
  // console.log("output", output);
  let outputAssets: any = [];
  Promise.all(
    Object.entries(output.value).map(([key, value]: any) => {
      // console.log("key", key);
      // console.log("value", value);
      key === "coins" && ( outputAssets.push( pluts.Value.lovelaces(output.value.coins)));
      key === "assets" &&  Object.entries(value).length > 0 &&
        Object.entries(value).map(([asset, quantity]: any) => {    
          let assetNew = pluts.Value.singleAsset(new pluts.Hash28(splitAsset(asset)[0]), fromHex(splitAsset(asset)[1]), quantity)
          outputAssets.push(assetNew);
        });
    })
  );
  return( outputAssets.reduce(pluts.Value.add));
};

/*
##########################################################################################################
Ignore all this, just refrence while building this.
#############################d############################################################################
*/
/*
builtTx Tx {
  body: TxBody {
    inputs: [ [TxIn], [TxIn] ],
    outputs: [ [TxOut], [TxOut] ],
    fee: [Getter/Setter],
    ttl: undefined,
    certs: undefined,
    withdrawals: undefined,
    protocolUpdate: undefined,
    auxDataHash: undefined,
    validityIntervalStart: undefined,
    mint: undefined,
    scriptDataHash: undefined,
    collateralInputs: undefined,
    requiredSigners: undefined,
    network: 'mainnet',
    collateralReturn: undefined,
    refInputs: undefined,
    hash: [Getter/Setter]
  },
  witnesses: TxWitnessSet {
    vkeyWitnesses: [Getter/Setter],
    bootstrapWitnesses: [Getter/Setter],
    datums: [Getter/Setter],
    nativeScripts: [Getter/Setter],
    plutusV1Scripts: [Getter/Setter],
    plutusV2Scripts: [Getter/Setter],
    redeemers: [Getter/Setter],
    isComplete: [Getter/Setter],
    addVKeyWitness: [Function (anonymous)]
  },
  isScriptValid: true,
  auxiliaryData: undefined,
  hash: [Getter/Setter],
  addVKeyWitness: [Function (anonymous)],
  signWith: [Function (anonymous)],
  signWithCip30Wallet: [Function (anonymous)],
  isComplete: [Getter/Setter]
}
*/
/*
where you see "entry" in the name generates a value for the array
if it has no "entry" it generates a value only with that entry
exapmple 

the Value class has an add static method
so you just do Value.add( assets1, assets2)
and you have a new Value instance

singing tx can be done with signWith method on a constructed tx
[9:30 AM]
signWith expects the private key

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
