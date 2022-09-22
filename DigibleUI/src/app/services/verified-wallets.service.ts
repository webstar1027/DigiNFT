import { Injectable } from '@angular/core';
import { Profile } from '../types/profile.type';
import { OffchainService } from '../services/offchain.service';
import { WalletService } from '../services/wallet.service';
// import { environment } from 'src/environments/environment';

@Injectable()
export class VerifiedWalletsService {
  public readonly verifiedCollectors = [
    { username: "Dan P", address: "0x097fd680c89f50E030458dd53481CDE529a0e643" },
    { username: 'Shedding Wizards', address: '0x93Ba74a9E34ce5Caa3B6C3037A983D43Cc4f680E',},
    { username: "Digible Minter Wallet", address: "0xe8f81ed131e63fb1323c3356ad559dd2692d8909" },
    { username: "unfederalmarine", address: "0x794B8bEEa5F92BDD0EfaE1618E3e9088229CC8c4" },
    { username: "Cross the boss", address:"0x1Ef622e590F0281cC19008f26960e2Aae12b6Edd" },
    { username: "dapengmvp", address:"0xf9bCB86830E7ef8cF83575d5F2fD95e5Db666Adf" },
    { username: "fsdfs11", address: "0xbE868af163CE2d5AD867D49b32e846c45820f2f2" },
    { username: "rr2812", address: "0xa378158fFbfBaA8Ba1906B3Ad6AdF72aC4961f1E" },
    { username: "shayhu", address: "0xB359F585F16553CBdFC56f8254DCE9BcF706d540" },
    { username: "CRYPTODAD7", address: "0xFcFc3a4FA3b95436438D5332b05eb3D903bA799A" },
    { username: "Kayelkay", address: "0xBdc0a8FEf06A371Bd05bCabE368bb248f04e3a67" },
    { username: "Elsuizo", address: "0x4C1dD0113D85fA6eC0aA4bF8F20Bcbe9D414c76f" },
    { username: "J_L_88", address: "0x33a7008C190548225112d8a1F1E4815D18D17151" },
    { username: "JasperJcash", address: "0x3Fb50Cb527ab3fC122909560F206dfFD76d9f4E5" },
    { username: "UMPHX", address: "0x62644d5A03abd371e175ad13aa7a7d2f6A2eBaE5" },
    { username: "definitelynotjames", address: "0x6065722b068b91F9155D2bf16375B8207120a995" },
    { username: "bryansosah", address: "0x59351B3Aac0950e2F29A40486bc5CE8bfC75B63c" },
    { username: "vi elliot", address: "0xA21f8534E9521C02981a0956106d6074abE9c60f" },
    { username: "Vintagetcgcollectables", address: "0x43f6a985B20C3dFa5215d1559cbC6fEd78bdf4fb" },
    { username: "Max", address: "0x405F91Bed1c4F08ce00f91793a912254a6DbE97B" },
    { username: "rainware8", address: "0x9422320eFA1DF54Dc62625a89f068e76324e2DDC" },
    { username: "mtmjdr0", address: "0xd952c734c23d1Cf1a7F6d13A95c35e8D3DE19F49" },
    { username: "ChuckFinley", address: "0xC4F4f936c4364Da7ECA5eEaCc6CD9F1C735a0839" },
    { username: "FightClub", address: "0x5aaf910846079a889A8f546d25d2F7090970b2d5" },
    { username: "Crypt0Wizard", address: "0xb4E1cf1b4C163f954cFAdb084ce51065213b9d33" },
    { username: "DIGIZARD", address: "0x341C42B0DE10FBDD60b10a0AbcD6C3565D736838" },
    { username: "Digible", address: "0x461A66090E15bc417fB0c75981eB6113b5E72CE4" },
    { username: "Escrow - Digible", address: "0xa1c80b8ea2ce44b889f48dbfa166597434f33904" },
    { username: "Migaladari", address: "0x8Ef6857fb72A8726Ab1eccC1E9296F079a465Ca4" },
    { username: "QnVegas", address: "0x984A2a68B6Fd544588Cb358e6C035079bad96258" },
    { username: "Roboskillz", address: "0x6dbdf9d84dE1d016c1598c3291278eD3aE7e569a" },
    { username: "SteveAoki", address: "0xe4bbcbff51e61d0d95fcc5016609ac8354b177c4" },
    { username: "Sunny6e", address: "0xd7f7d732BD74efA1C39FeC5FDF28167cd14970fE" },
    { username: "Testnet - Digible", address: "0x828Baa8802CdC76Bee4904cF5E063f587185D564" },
    { username: "Testnet - Escrow - Digible", address: "0x5e1320Aa48eB7C927A9386f6B194bF57de149645" },
    { username: "The El Sputnik Collection", address: "0x2e8e67e67a138e1D1aA24857A0242b788ca388ac" },
    { username: "coinsnrarities", address: "0x7315F019b4B8010B2c3680bA70F497B4ec012223" },
    { username: "defiTrophy.com Collection", address: "0xf0EDE1a2FD711d6333C5d9a0525DBb12d25c6584" },
    { username: "_SystemLabs", address: "0xe176A3B77DA8a0a463D7d77715f11446F7c75F31" },
    { username: "Carbon Breaks", address: "0x6A4B37BE413b00f81826e12793790756cc67d954" },
    { username: "CryptoDad NFT", address: "0xbcd9012b8a7d6932cc45d1739261ed73b90319cf" },
    { username: "MTF Slasher", address: "0xD10880d5a8235ADA1F9694FF756A09D104Ad3981" },
    { username: "Crypto Bigdawg", address: "0x062220922eec3B5f0Be91a0FAd8ddB5Eff229e74" },
    { username: "Ikeinvest", address: "0xF6A7971C581AA5b0C390Ec68DE8fcFf3c4E06c1E" },
    { username: "Tooopp", address: "0x91dcb1A361caDb532949242AED7Acc36413DF29b" },
    { username: "Baarathsri", address: "0x2EC090C0dcdaB1492bd4421b656Caf012fF8E715" },
    { username: "Vintagetcgcollectables", address: "0x43f6a985B20C3dFa5215d1559cbC6fEd78bdf4fb" },
    { username: "Medi Scape", address: "0x33f06fF275b4BD7F6A26FA8aA1a4836FfC2A8232" },
    { username: "TangomanGT", address: "0xF6A7971C581AA5b0C390Ec68DE8fcFf3c4E06c1E" },
    { username: "makalukamakaluka", address: "0xD5ebe364eB249047EB82CfE1581bfe17782c0B61" }
  ];
  public verifiedCollectorsFromOffchain = [];

  constructor(
    public offchain: OffchainService,
    public wallet: WalletService
    ) {
  }

  async getAllVerifiedWalletAddresses():Promise<any> {
    this.verifiedCollectorsFromOffchain = await this.offchain.getAllVerifiedWalletAddresses();
    return this.verifiedCollectorsFromOffchain;
  }
  
  async getVerifiedAddress(address: string):Promise<any> {    
    const verifiedAddress = (await this.offchain.getVerifiedAddress(this.wallet.getWeb3().utils.toChecksumAddress(address))).address;
    console.log(verifiedAddress);
    
    if(verifiedAddress) {
      return verifiedAddress;
    } else {
      return false;
    }
  }

  getAllVerifiedProfiles() {
    return this.verifiedCollectors;
  }

  truncate(fullStr, strLen, separator) {
		if (fullStr.length <= strLen) return fullStr;

		separator = separator || '...';

		var sepLen = separator.length,
			charsToShow = strLen - sepLen,
			frontChars = Math.ceil(charsToShow / 2),
			backChars = Math.floor(charsToShow / 2);

		return (
			fullStr.substr(0, frontChars) +
			separator +
			fullStr.substr(fullStr.length - backChars)
		);
	}

  async getVerifiedName(address: string): Promise<any> {
    const verifiedName = (await this.offchain.getVerifiedAddress(this.wallet.getWeb3().utils.toChecksumAddress(address))).username;
    if(verifiedName) {
      return verifiedName;
    } else {
      return false;
    }
  }

  async getWalletOwnerName(address: string): Promise<any> {
    if (this.verifiedCollectorsFromOffchain.length === 0) await this.getAllVerifiedWalletAddresses();
    let verifiedName = this.truncate(address, 15, '...');
    const ownerAddress = this.wallet.getWeb3().utils.toChecksumAddress(address);
    this.verifiedCollectorsFromOffchain.forEach((collector) => {
      if (collector.address.toLowerCase() === ownerAddress.toLowerCase()) {
        verifiedName = collector.username;
      }
    });
    return verifiedName;
  }

  async getFullProfile(address: string): Promise<any> {
    address = this.wallet.getWeb3().utils.toChecksumAddress(address);
    return new Promise(async (resolve, reject) => {
      await this.offchain
        .getProfileData(address)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async updProfileData(
    address: string,
    profileImage: string,
    heroImage: string,
    username: string,
    description: string,
    twitter: string,
    instagram: string,
    email: string,
    twitch: string,
    tiktok: string
  ) {
    const ipfs = await this.offchain.updProfile(
      address,
      profileImage,
      heroImage,
      username,
      description,
      twitter,
      instagram,
      email,
      tiktok,
      twitch
    );
    return ipfs['status'] == 'success';
  }
}
