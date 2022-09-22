import { address } from "@maticnetwork/maticjs/dist/ts/types/Common";

export type TradeOffer = {
    offerId: number;
    myNFTAddress1: address;
    myNFTTokenId1: number;
    myNFTAddress2: address;
    myNFTTokenId2: number;

    myERC20Address: address;    
    myERC20Qty:number

    theirNFTAddress1: address;
    theirNFTTokenId1: number;
    theirNFTAddress2: address;
    theirNFTTokenId2: number;

    theirERC20Address: address;    
    theirERC20Qty:number;

    tradeDone: boolean;
    tradeCXL: boolean;
    tradeProcessing:boolean;

  };
  

       
    