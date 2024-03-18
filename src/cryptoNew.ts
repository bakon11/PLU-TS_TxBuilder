import { mnemonicToEntropy, generateMnemonic, validateMnemonic, } from "bip39";
import CryptoJS from "crypto-js";
import * as plutsBip from "@harmoniclabs/bip32_ed25519";

const harden = (num: number) => {
  return 0x80000000 + num;
};

export const genSeedPhrase = async () => {
  try {
    const mnemonic = generateMnemonic(256);
    // console.log("new mnemonic: " + mnemonic);
    return mnemonic;
  } catch (error) {
    console.error(error);
    return error;
  }
};

export const validateSeedPhrase = async (seed: any) => {
  try {
    const validate = validateMnemonic(seed);
    return validate;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const seedPhraseToEntropy = async (seed_phrase: string) => {
  return mnemonicToEntropy(seed_phrase);
};

export const genRootPrivateKey = async (entropy: any) => {
  try{
    const rootKey: any = plutsBip.XPrv.fromEntropy(entropy);
    // console.log("rootKey", rootKey);
    return rootKey
  } catch (error) {
    console.log("root key error: ", error); 
  }
};


export const genAccountPrivatekey= async (rootKey: any, index: any ) => {
  // hardened derivation
  const accountKey = rootKey
  .derive(harden(1852)) // purpose
  .derive(harden(1815)) // coin type
  .derive(harden(index)); // account #0


  return(accountKey);
};

export const genAddressPrivatekey = async (accountKey: any, type: number, index: number) => {
  const spendingKey = accountKey
        .derive(type) // 0 external || 1 change || 2 stake key
        .derive(index); // index
  return spendingKey;
};