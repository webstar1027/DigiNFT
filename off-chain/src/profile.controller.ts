import { Controller, Get, Param, Body, Post, BadRequestException } from '@nestjs/common';
import { Profile, UsedCode } from './dtos/profile.dto';
import { MoralisService } from './services/moralis.service';

const verifiedCollectors = [
  { username: 'Dan P', address: '0x097fd680c89f50E030458dd53481CDE529a0e643' },
  {
    username: 'Shedding Wizards',
    address: '0x93Ba74a9E34ce5Caa3B6C3037A983D43Cc4f680E',
  },
  {
    username: 'Digible Minter Wallet',
    address: '0xe8F81ED131e63fb1323c3356aD559DD2692d8909',
  },
  {
    username: 'unfederalmarine',
    address: '0x794B8bEEa5F92BDD0EfaE1618E3e9088229CC8c4',
  },
  {
    username: 'Cross the boss',
    address: '0x1Ef622e590F0281cC19008f26960e2Aae12b6Edd',
  },
  {
    username: 'dapengmvp',
    address: '0xf9bCB86830E7ef8cF83575d5F2fD95e5Db666Adf',
  },
  {
    username: 'fsdfs11',
    address: '0xbE868af163CE2d5AD867D49b32e846c45820f2f2',
  },
  { username: 'rr2812', address: '0xa378158fFbfBaA8Ba1906B3Ad6AdF72aC4961f1E' },
  { username: 'shayhu', address: '0xB359F585F16553CBdFC56f8254DCE9BcF706d540' },
  {
    username: 'CRYPTODAD7',
    address: '0xFcFc3a4FA3b95436438D5332b05eb3D903bA799A',
  },
  {
    username: 'Kayelkay',
    address: '0xBdc0a8FEf06A371Bd05bCabE368bb248f04e3a67',
  },
  {
    username: 'Elsuizo',
    address: '0x4C1dD0113D85fA6eC0aA4bF8F20Bcbe9D414c76f',
  },
  { username: 'J_L_88', address: '0x33a7008C190548225112d8a1F1E4815D18D17151' },
  {
    username: 'JasperJcash',
    address: '0x3Fb50Cb527ab3fC122909560F206dfFD76d9f4E5',
  },
  { username: 'UMPHX', address: '0x62644d5A03abd371e175ad13aa7a7d2f6A2eBaE5' },
  {
    username: 'definitelynotjames',
    address: '0x6065722b068b91F9155D2bf16375B8207120a995',
  },
  {
    username: 'bryansosah',
    address: '0x59351B3Aac0950e2F29A40486bc5CE8bfC75B63c',
  },
  {
    username: 'vi elliot',
    address: '0xA21f8534E9521C02981a0956106d6074abE9c60f',
  },
  {
    username: 'Vintagetcgcollectables',
    address: '0x43f6a985B20C3dFa5215d1559cbC6fEd78bdf4fb',
  },
  { username: 'Max', address: '0x405F91Bed1c4F08ce00f91793a912254a6DbE97B' },
  {
    username: 'rainware8',
    address: '0x9422320eFA1DF54Dc62625a89f068e76324e2DDC',
  },
  {
    username: 'mtmjdr0',
    address: '0xd952c734c23d1Cf1a7F6d13A95c35e8D3DE19F49',
  },
  {
    username: 'ChuckFinley',
    address: '0xC4F4f936c4364Da7ECA5eEaCc6CD9F1C735a0839',
  },
  {
    username: 'FightClub',
    address: '0x5aaf910846079a889A8f546d25d2F7090970b2d5',
  },
  {
    username: 'Crypt0Wizard',
    address: '0xb4E1cf1b4C163f954cFAdb084ce51065213b9d33',
  },
  {
    username: 'DIGIZARD',
    address: '0x341C42B0DE10FBDD60b10a0AbcD6C3565D736838',
  },
  {
    username: 'Digible',
    address: '0x461A66090E15bc417fB0c75981eB6113b5E72CE4',
  },
  {
    username: 'Escrow - Digible',
    address: '0xa1c80b8ea2ce44b889f48dbfa166597434f33904',
  },
  {
    username: 'Migaladari',
    address: '0x8Ef6857fb72A8726Ab1eccC1E9296F079a465Ca4',
  },
  {
    username: 'QnVegas',
    address: '0x984A2a68B6Fd544588Cb358e6C035079bad96258',
  },
  {
    username: 'Roboskillz',
    address: '0x6dbdf9d84dE1d016c1598c3291278eD3aE7e569a',
  },
  {
    username: 'SteveAoki',
    address: '0xe4bbcbff51e61d0d95fcc5016609ac8354b177c4',
  },
  {
    username: 'Sunny6e',
    address: '0xd7f7d732BD74efA1C39FeC5FDF28167cd14970fE',
  },
  {
    username: 'Testnet - Digible',
    address: '0x828Baa8802CdC76Bee4904cF5E063f587185D564',
  },
  {
    username: 'Testnet - Escrow - Digible',
    address: '0x5e1320Aa48eB7C927A9386f6B194bF57de149645',
  },
  {
    username: 'The El Sputnik Collection',
    address: '0x2e8e67e67a138e1D1aA24857A0242b788ca388ac',
  },
  {
    username: 'coinsnrarities',
    address: '0x7315F019b4B8010B2c3680bA70F497B4ec012223',
  },
  {
    username: 'defiTrophy.com Collection',
    address: '0xf0EDE1a2FD711d6333C5d9a0525DBb12d25c6584',
  },
  {
    username: '_SystemLabs',
    address: '0xe176A3B77DA8a0a463D7d77715f11446F7c75F31',
  },

  {
    username: 'Carbon Breaks',
    address: '0x6A4B37BE413b00f81826e12793790756cc67d954',
  },
  {
    username: 'CryptoDad NFT',
    address: '0xbcd9012b8a7d6932cc45d1739261ed73b90319cf',
  },
  {
    username: 'MTF Slasher',
    address: '0xD10880d5a8235ADA1F9694FF756A09D104Ad3981',
  },
  {
    username: 'Crypto Bigdawg',
    address: '0x062220922eec3B5f0Be91a0FAd8ddB5Eff229e74',
  },
  {
    username: 'Ikeinvest',
    address: '0xF6A7971C581AA5b0C390Ec68DE8fcFf3c4E06c1E',
  },
  
  {
    username: 'Tooopp',
    address: '0x91dcb1A361caDb532949242AED7Acc36413DF29b',
  },
  {
    username: 'Baarathsri',
    address: '0x2EC090C0dcdaB1492bd4421b656Caf012fF8E715',
  },

  {
    username: 'Medi Scape',
    address: '0x088176F64962FA736389dCaFEc4b56AB3887E277',
  },
  {
    username: 'TangomanGT',
    address: '0x33f06fF275b4BD7F6A26FA8aA1a4836FfC2A8232',
  },
  {
    username: 'makalukamakaluka',
    address: '0xD5ebe364eB249047EB82CfE1581bfe17782c0B61',
  },
  {
    username: 'CryptoDadNFT',
    address: '0xBcD9012b8A7D6932cC45d1739261ed73b90319cf',
  },
  {
    username: 'AngelMic',
    address: '0xbBF2d07b1217C306b02F1A3A6abfC01a406538c3',
  },
  {
    username: 'topstar',
    address: '0xD1fDB516F26cB7766B39fa10529B18A01d33A492',
  },
  {
    username: 'topstar1',
    address: '0xa1d27EB664a0DF5aa81E32AA0fb9D43647609635',
  }
];

@Controller()
export class ProfileController {
  constructor(private readonly moralis: MoralisService) {}
  @Get('/getAllVerifiedWalletAddresses')
  getAllVerifiedWalletAddresses() {
    return verifiedCollectors;
  }

  @Get('/getVerifiedAddress/:address')
  getVerifiedAddress(@Param('address') address: string) {
    let verifiedCollector;
    verifiedCollectors.forEach((collector) => {
      if (collector.address.toLowerCase() === address.toLowerCase()) {
        verifiedCollector = collector;
      }
    });
    if (verifiedCollector) {
      return verifiedCollector;
    } else {
      return false;
    }
  }

  @Get('/profile/:id')
  getProfile(@Param('id') id: string) {
    const fs = require('fs');
    const data2 = JSON.parse(fs.readFileSync('data/input.json', 'utf8'));
    let result;
    if (!data2[id]) {
      const newProfileData = {
        picture: '',
        hero_picture: '',
        username: '',
        description: '',
        twitter: '',
        instagram: '',
        email: '',
        tiktok: '',
        twitch: '',
      };
      data2[id] = newProfileData;
      result = data2[id];
      fs.writeFile('data/input.json', JSON.stringify(data2), function (err) {
        if (err) throw err;
      });
      result['status'] = 'success';
      return result;
    } else {
      if (!data2[id].username) {
        verifiedCollectors.forEach((collector) => {
          if (collector.address.toLowerCase() === id.toLowerCase()) {
            data2[id]['username'] = collector.username;
          }
        });
      }
      if (data2[id].hero_picture === 'undefined') {
        data2[id]['hero_picture'] = '';
      }
      result = data2[id];
      result['status'] = 'success';
      return result;
    }
  }

  @Post('/profile/upd/:id')
  updProfile(@Param('id') id: string, @Body() body: Profile) {
    const prf = JSON.parse(body['da']);
    const fs = require('fs');
    const data2 = JSON.parse(fs.readFileSync('data/input.json', 'utf8'));

    data2[id]['username'] = prf['username'];
    data2[id]['picture'] = prf['picture'];
    data2[id]['hero_picture'] = prf['hero_picture'];
    data2[id]['description'] = prf['description'];
    data2[id]['twitter'] = prf['twitter'];
    data2[id]['instagram'] = prf['instagram'];
    data2[id]['email'] = prf['email'];
    data2[id]['tiktok'] = prf['tiktok'];
    data2[id]['twitch'] = prf['twitch'];

    fs.writeFile('data/input.json', JSON.stringify(data2), function (err) {
      if (err) throw err;
    });

    const result = data2[id];
    result['status'] = 'success';
    result['updated'] = 'updated';
    return result;
  }

  @Get('/usedcode/:address')
  getUsedCode(@Param('address') address: string) {
    const fs = require('fs');
    const result = {};
    const usedCodes = JSON.parse(fs.readFileSync('data/usedCode.json', 'utf8'));

    if (typeof usedCodes[address] === 'undefined') {
      // if not exist return all used codes stored in json
      result['data'] = usedCodes;
      result['isExist'] = false;
    } else {
      result['data'] = usedCodes[address]
      result['isExist'] = true;
    }

    result['status'] = 'success';
    return result;
  }

  @Post('/usedcode')
  setUsedCode(@Body() body: UsedCode) {
    const fs = require('fs');
    const usedCodes = JSON.parse(fs.readFileSync('data/usedCode.json', 'utf8'));

    if (usedCodes[body.address] !== undefined) {
      // if address already exist return `duplicate`
      return {
        'status': 'duplicate',
      };
    }

    usedCodes[body.address] = body.usedCode
    fs.writeFile('data/usedCode.json', JSON.stringify(usedCodes), function (err) {
      if (err) throw err;
    });

    const result = {
      'status': 'success',
    };
    return result;
  }

  @Post('/sale/create')
  async createSale(@Body() body) {
    const saleId = body.saleId;
    const network = body.network;
    const nSaleData = await this.moralis.getSaleById(saleId, network);
    const fs = require('fs');
    const salesData = JSON.parse(fs.readFileSync(`data/sales-${network}.json`, 'utf8'));
    const fIndex = salesData.findIndex((item) => item.tokenId == nSaleData.tokenId);
    if (fIndex == -1) {
      // Create new sale to json
      salesData.push({
        ...nSaleData,
        saleId,
        available: true,
      });
    } else {
      // Update existing sale data
      salesData[fIndex] = nSaleData;
    }

    fs.writeFile(`data/sales-${network}.json`, JSON.stringify(salesData), function (err) {
      if (err) throw err;
    });

    const result = {
      'status': 'success',
    };
    return result;
  }

  @Post('/sale/remove')
  async removeSale(@Body() body) {
    const saleId = body.saleId;
    const network = body.network;
    const fs = require('fs');
    const salesData = JSON.parse(fs.readFileSync(`data/sales-${network}.json`, 'utf8'));
    const fIndex = salesData.findIndex((item) => item.saleId == saleId);
    if (fIndex > -1) {
      salesData.splice(fIndex, 1);
      fs.writeFile(`data/sales-${network}.json`, JSON.stringify(salesData), function (err) {
        if (err) throw err;
      });
      const result = {
        'status': 'success',
      };
      return result;
    }

    throw new BadRequestException('Not existing');
  }

  @Post('/sale/update')
  async updateSale(@Body() body) {
    const saleId = body.saleId;
    const network = body.network;
    const fs = require('fs');
    const salesData = JSON.parse(fs.readFileSync(`data/sales-${network}.json`, 'utf8'));
    const fIndex = salesData.findIndex((item) => item.saleId == saleId);
    if (fIndex > -1) {
      const newData = body.data;
      salesData[fIndex] = {
        ...salesData[fIndex],
        ...newData,
      }
      fs.writeFile(`data/sales-${network}.json`, JSON.stringify(salesData), function (err) {
        if (err) throw err;
      });
      const result = {
        'status': 'success',
      };
      return result;
    }

    throw new BadRequestException('Not existing');
  }

  @Post('/sale')
  async getSaleData(@Body() body) {
    const isAuction = (body.type == 'auction');
    const network = body.network;
    const fs = require('fs');
    const salesData = JSON.parse(fs.readFileSync(`data/sales-${network}.json`, 'utf8'));
    const currentDate = new Date().getTime() / 1000;
    const auctionData = salesData.filter((item) => (item.isAuction == isAuction && parseInt(item.endDate, 10) >= currentDate));

    const result = {
      'status': 'success',
      data: JSON.stringify(auctionData)
    };
    return result;
  }

  @Post('/sale/:token_id')
  async getSaleDataByTokenId(@Param('token_id') token_id: string, @Body() body) {
    const network = body.network;
    const fs = require('fs');
    const salesData = JSON.parse(fs.readFileSync(`data/sales-${network}.json`, 'utf8'));
    const saleItem = salesData.find((item) => item.tokenId == token_id);

    if (saleItem === undefined) {
      return {
        'status': 'not exist'
      };
    }
    return {
      'status': 'success',
      data: JSON.stringify(saleItem)
    };
  }
}
