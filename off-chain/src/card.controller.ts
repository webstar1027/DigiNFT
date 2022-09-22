import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import * as eth721abi from '../abis/eth721.json';
import { AddDesc } from './dtos/add-desc.dto';
import { CacheService } from './services/cache.service';
import { DescriptionsService } from './services/descriptions.service';

@Controller(['card', 'nft', 'cube'])
export class CardController {
  private Web3;

  private readonly eth721Address = '0x4e4e06dfB3aCD27e6a96fEc7458726EEc5b487d0';
  private readonly eth721AddressTestNet =
    '0x4e4e06dfB3aCD27e6a96fEc7458726EEc5b487d0';

  private readonly eth721AddressTestNetMatic =
    '0x2050ebd262Db421De662607A05be26930Edbb8C8';
  private readonly eth721AddressMatic =
    '0x1eA016dcD53bA2EBe9DbD1C0418FF816b6FF9B25';

  private readonly digiCubeAddressMatic =
    '0x4D4475E5591c00525069c52f3489bE59b321ba64';
  private readonly digiCubeAddressTestNetMatic =
    '0xa4ACe9a3D90fbAe14a4b42698F480f4282a49A2d';

  constructor(
    private readonly cache: CacheService,
    private readonly descriptions: DescriptionsService,
  ) {
    this.Web3 = require('web3');
  }

  @Post('description/:network/:id')
  async description(
    @Param('id') id: string,
    @Param('network') network: string,
    @Body() body: AddDesc,
  ): Promise<void> {
    const address = this.getEthWeb3().eth.accounts.recover(
      body.description,
      body.signature,
    );
    if (
      (await (await this.getContract(network)).methods.ownerOf(id).call()) !==
      address
    ) {
      throw new ForbiddenException('Signed message is not from the owner');
    }
    this.descriptions.addDescription(id, body.description);
  }

  @Get('cube/:id')
  async getCube(@Param('id') id: string) {
    return this.parseResponse(await this.getCubeData(id));
  }

  private async getCubeData(tokenId: string) {
    const cached = this.cache.get(tokenId);
    if (cached) {
      return cached;
    }

    let web3;
    let contract;
    if (process.env.TESTNET === '1') {
      contract = new (await this.getMaticTestnetWeb3()).eth.Contract(
        eth721abi,
        this.digiCubeAddressTestNetMatic,
      );
    } else {
      web3 = this.getMaticWeb3();
      contract = new web3.eth.Contract(eth721abi, this.digiCubeAddressMatic);
    }
    const image = await contract.methods.cardImage(tokenId).call();
    const name = await contract.methods.cardName(tokenId).call();
    const physical = await contract.methods.cardPhysical(tokenId).call();
    let description = '';

    if (!description) {
      description = 'DigiCube NFT number ' + tokenId;
    }

    const response = {
      description,
      image,
      name,
      physical,
    };
    this.cache.set(tokenId, response);
    console.log(response);
    return response;
  }

  /*   @Get(':id/:network')
  async getCard(@Param('id') id: string, @Param('network') network: string) {
    return this.parseResponse(await this.getDataFromChain(id, network));
  } */
  @Get('sale/:contract/:id/:network')
  async getNFTMetaData(
    @Param('contract') contract: string,
    @Param('id') id: string,
    @Param('network') network: string
  ) {
    const NFTData = require(process.cwd()+"/dist/data/nftlist.json");
    return NFTData.find(item => item.token_id == id);
  }

  @Get('sales')
  async getTotalSales() {
    const fs = require('fs');
    const salesData = JSON.parse(fs.readFileSync('data/sales-MATIC.json', 'utf8'));
    return salesData;
  }


  @Get(':id/:network/:contract?')
  async getCard(
    @Param('id') id: string,
    @Param('network') network: string,
    @Param('contract') contractAddress?: string,
  ) {
    return this.parseResponse(
      await this.getDataFromChain(id, network, contractAddress),
    );
  }

  private async getDataFromChain(
    tokenId: string,
    network: string,
    contractAddress?: string,
  ) {
    const cached = this.cache.get(tokenId);
    if (cached) {
      return cached;
    }
    let contract: any;
    if (network === 'ETH') {
      contract = this.getContract('ETH');
    } else if (network === 'MATIC') {
      contract = this.getContract('MATIC');
    }

    if (contractAddress) {
      contract = this.getContractWithAddress(network, contractAddress);
    }
    const image = await contract.methods.cardImage(tokenId).call();
    const name = await contract.methods.cardName(tokenId).call();
    const physical = await contract.methods.cardPhysical(tokenId).call();
    let description = '';

    if (!description) {
      description = 'Digible digital NFT number ' + tokenId;

      if (physical) {
        description =
          'Digible digital NFT number ' +
          tokenId +
          ' backed by physical asset.';
      }
    }

    const response = {
      description,
      image,
      name,
      physical,
    };
    this.cache.set(tokenId, response);
    return response;
  }

  private parseResponse(response: any): any {
    if (
      !response.image.startsWith('http://') &&
      !response.image.startsWith('https://')
    ) {
      response.image = process.env.IPFS_NODE + '/ipfs/' + response.image;
    }
    return response;
  }

  private getContract(chain) {
    if (process.env.TESTNET === '1') {
      if (chain === 'ETH') {
        const web3 = this.getEthTestnetWeb3();
        return new web3.eth.Contract(eth721abi, this.eth721AddressTestNet);
      } else if (chain === 'MATIC') {
        const web3 = this.getMaticTestnetWeb3();
        return new web3.eth.Contract(eth721abi, this.eth721AddressTestNetMatic);
      }
    } else {
      if (chain === 'ETH') {
        const web3 = this.getEthWeb3();
        return new web3.eth.Contract(eth721abi, this.eth721Address);
      } else if (chain === 'MATIC') {
        const web3 = this.getMaticWeb3();
        return new web3.eth.Contract(eth721abi, this.eth721AddressMatic);
      }
    }
  }

  private getContractWithAddress(network, address) {
    if (process.env.TESTNET === '1') {
      const web3 = this.getMaticTestnetWeb3();
      return new web3.eth.Contract(eth721abi, address);
    } else {
      const web3 = this.getMaticWeb3();
      return new web3.eth.Contract(eth721abi, address);
    }
    
  }

  private getEthTestnetWeb3(): any {
    return new this.Web3(
      'wss://kovan.infura.io/ws/v3/' + process.env.INFURA_ID,
    );
  }

  private getMaticTestnetWeb3(): any {
    return new this.Web3(
      'wss://polygon-mumbai.infura.io/ws/v3/' + process.env.INFURA_ID,
    );
  }

  private getEthWeb3(): any {
    return new this.Web3(
      'wss://mainnet.infura.io/ws/v3/' + process.env.INFURA_ID,
    );
  }
  private getMaticWeb3(): any {
    return new this.Web3(
      'wss://polygon-mainnet.infura.io/ws/v3/' + process.env.INFURA_ID,
    );
  }
}
