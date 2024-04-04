import { mnemonicToEntropy, generateMnemonic, validateMnemonic, } from "bip39";
import CryptoJS from "crypto-js";
import * as testBip from "@mandalaverse/bip32ed25519";

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

export const seedPhraseToEntropy3 = async (seed_phrase: string) => {
  return mnemonicToEntropy(seed_phrase);
};

export const genRootPrivateKey3 = async (entropy: any) => {
  console.log(entropy);
  try{
    const rootKey = testBip.Bip32PrivateKey.fromEntropy(Buffer.from(entropy, "hex"));
    // console.log("rootKey", rootKey);
    return(rootKey)
  } catch (error) {
    console.log("root key error: ", error); 
  }
};


export const genAccountPrivatekey3 = async (rootKey: any, index: any ) => {
  // hardened derivation
  const accountKey = rootKey
    .derive(harden(1852)) // purpose
    .derive(harden(1815)) // coin type
    .derive(harden(index)); // account #0
  return(accountKey);
};

export const genAddressPrivatekey3 = async (accountKey: any, type: number, index: number) => {
  const spendingKey = accountKey
    .derive(type) // 0 external || 1 change || 2 stake key
    .derive(index); // index
  return spendingKey;
};