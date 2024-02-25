import * as CSLwasm from "@dcspark/cardano-multiplatform-lib-nodejs";
import { mnemonicToEntropy, generateMnemonic, validateMnemonic } from 'bip39';
import CryptoJS from "crypto-js";

const harden = (num) => {
  return 0x80000000 + num;
};

export const genSeedPhrase = async () => {
  try{
    const mnemonic = generateMnemonic(256);
    // console.log("new mnemonic: " + mnemonic);
    return( mnemonic );
  }catch( error ){
    console.error( error );
    return( error );
  };  
};

export const validateSeedPhrase = async ( seed ) => {
  try{
    const validate = validateMnemonic(seed);
    return(validate);
  }catch(error){
    console.log(error);
    return ( error );
  };
};

export const seedPhraseToEntropy = async ( seed_phrase ) => {
	return mnemonicToEntropy(seed_phrase);
};

//Root private key to create accounts
export const genXPRV = async ( entropy ) => {
  try{
    return CSLwasm.Bip32PrivateKey.from_bip39_entropy(
      Buffer.from(entropy, 'hex'),
      Buffer.from(''),
    );
  }catch( error ){
      console.log(error)
      return(error);
  };
};

export const genXPUB = async ( accountKeyPrv ) => {
  try{
    const accountKeyPub = await accountKeyPrv.to_public();
    return(accountKeyPub);
  }catch( error ){
    console.log( error );
    return( error );
  };
};

// account private key to create addresses
export const genAccountKeyPrv = async (rootKey, purpose, coinType, accIndex ) => {
  // purpose = 1852;
  // coinType = 1815;
  try{
    return await rootKey
      .derive(harden(purpose))   // purpose
      .derive(harden(coinType))  // coin_type
      .derive(harden(accIndex)); // account #0
  }catch( error ){
    console.log(error);
    return(error);
  };
};


export const genAccountKeyPub = async ( accountKeyPrv ) => {
  try{
    const accountKeyPub = await accountKeyPrv.to_public();
    return(accountKeyPub);
  }catch( error ){
    console.log( error );
    return( error );
  };
};

// Address private key to sign TXs with.
export const genAddressSigningKey = async ( accountKeyPrv, index ) => {
  try{
    const utxoKey = accountKeyPrv
      .derive(0) // 0 external || 1 change || 2 stake key
      .derive(index) // index
    return(utxoKey);    
  }catch(error){
    console.log("genAddressSigningKey", error);
    return(error);
  }
};

export const genChangeKey = async ( accountKeyPrv, index ) => {
  try{
    const stakeKey = accountKeyPrv
      .derive(1) // 0 external || 1 change || 2 stake key
      .derive(index) // index
    return(stakeKey);
  }catch(error){
    console.log(error);
    return(error);
  };
}

export const genStakeKey = async ( accountKeyPrv, index ) => {
  try{
    const stakeKey = accountKeyPrv
      .derive(2) // 0 external || 1 change || 2 stake key
      .derive(index) // index
    return(stakeKey);
  }catch(error){
    console.log(error);
    return(error);
  };
};

// base address with staking key
export const genBaseAddr = async ( network, addressPubKey, stakeKey ) => {
  try{
    const baseAddr = CSLwasm.BaseAddress.new(
      network, // 0 testnet || 1 mainnet
      CSLwasm.StakeCredential.from_keyhash(addressPubKey.to_raw_key().hash()),
      CSLwasm.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash()),
    );
    return( baseAddr );
  }catch( error ){ 
    console.log( error );
    return( error );
  };
};

// enterprise address without staking ability, for use by exchanges/etc
export const genEnterpriseAddr = async ( network, addressPubKey ) => {
  try{
    const enterpriseAddr = CSLwasm.EnterpriseAddress.new(
      network, // 0 testnet || 1 mainnet
      CSLwasm.StakeCredential.from_keyhash(addressPubKey.to_raw_key().hash())
    );
    return(enterpriseAddr);
  }catch( error ){
    console.log( error )
    return( error );
  }  
};

// pointer address - similar to Base address but can be shorter, see formal spec for explanation
export const genPointerAddr = async ( network, addressPubKey ) => {
  try{
    const ptrAddr = CSLwasm.PointerAddress.new(
      network, // 0 testnet || 1 mainnet
      CSLwasm.StakeCredential.from_keyhash(addressPubKey.to_raw_key().hash()),
      CSLwasm.Pointer.new(
        100, // slot
        2,   // tx index in slot
        0    // cert indiex in tx
      )
    );
    return( ptrAddr );
  }catch( error ){
    console.log( error );
    return( error );
  };
};

// reward address - used for withdrawing accumulated staking rewards
export const genRewardAddr = async ( network, stakeKey ) => {
  try{
    const rewardAddr = CSLwasm.RewardAddress.new(
      network, // 0 testnet || 1 mainnet
      CSLwasm.StakeCredential.from_keyhash(stakeKey.to_raw_key().hash())
    );
    return( rewardAddr );
  }catch( error ){
    console.log( error );
    return( error );
  };
};

// bootstrap address - byron-era addresses with no staking rights
export const genByronAddr = async ( network, utxoPubKey ) => {
  try{
    const byronAddr = CSLwasm.ByronAddress.icarus_from_key(
      utxoPubKey, // Ae2* style icarus address
      network, // 0 testnet || 1 mainnet
    );
    return( byronAddr );
  }catch( error ){
    console.log( error );
    return( error );
  };
};

export const encrypt = async ( passPhrase, text ) => {
  try{
    const encrypted = await CryptoJS.AES.encrypt(JSON.stringify(text), passPhrase).toString();
    return(encrypted);
  }catch(error){
    console.log("encrypt error", error);
    return(error);
  };
};

export const decrypt = async ( passPhrase, text ) => {
  try{
    const decrypted = await CryptoJS.AES.decrypt(text, passPhrase).toString(CryptoJS.enc.Utf8);
    return(decrypted);
  }catch( error ){
      console.log( "decreypt error", error );
      return( error );
  };
};