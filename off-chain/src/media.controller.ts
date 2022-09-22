/* eslint-disable @typescript-eslint/no-var-requires */
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import * as eth721abi from '../abis/eth721.json';
import * as ipfsAPI from 'ipfs-api';
import { CreateMediaDto } from './dtos/create-media.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';

@Controller('media')
export class MediaController {
  private Web3;
  private ipfsClient;
  private readonly eth721Address = '0x4e4e06dfB3aCD27e6a96fEc7458726EEc5b487d0';
  private readonly eth721AddressTestNet =
    '0x4e4e06dfB3aCD27e6a96fEc7458726EEc5b487d0';

  constructor() {
    this.Web3 = require('web3');
    this.ipfsClient = ipfsAPI('/ip4/127.0.0.1/tcp/5001');
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createMedia(
    @Body() body: CreateMediaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // console.log('body:', body);
    // console.log('file:', file);
    if (!file) {
      throw new BadRequestException('Missing file');
    }
    const address = this.getWeb3().eth.accounts.recover(
      'Digible',
      body.signature,
    );
    // console.log(address);
    /* if (!(await this.canMint(address))) {
      throw new ForbiddenException('Signed message is not from a minter');
    } */
    const cid = (await this.ipfsClient.add(file.buffer))[0].hash;
    // console.log(cid);
    // console.log(process.env.IPFS_NODE + '/ipfs/' + cid);
    return {
      hash: cid,
      uri: process.env.IPFS_NODE + '/ipfs/' + cid,
    };
  }

  /* private async canMint(address: string): Promise<boolean> {
    const minterRole =
      '0xf0887ba65ee2024ea881d91b74c2450ef19e1557f03bed3ea9f16b037cbe2dc9';
    return await (await this.getEthContract()).methods
      .hasRole(minterRole, address)
      .call();
  } */

  private getEthContract() {
    if (process.env.TESTNET == '1') {
      const web3 = this.getTestnetWeb3();
      return new web3.eth.Contract(eth721abi, this.eth721AddressTestNet);
    }
    const web3 = this.getWeb3();
    return new web3.eth.Contract(eth721abi, this.eth721Address);
  }

  private getTestnetWeb3(): any {
    return new this.Web3(
      'wss://ropsten.infura.io/ws/v3/' + process.env.INFURA_ID,
    );
  }

  private getWeb3(): any {
    return new this.Web3(
      'wss://mainnet.infura.io/ws/v3/' + process.env.INFURA_ID,
    );
  }
}
