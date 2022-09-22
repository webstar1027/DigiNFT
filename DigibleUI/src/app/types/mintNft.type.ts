import { ERC20Currency } from "./ERC20currency.type";

export type mintNft = {
  nft_name?:string;
  image?: string;
  description?:string;
  token_address?: string;
  metadataJsonUri?:string;
  metadata?: string[];
  network?: string;
  physical?: boolean;
  minMintPrice?: number;
  mintCurrency?: string;
  mintCurrencyERC20?: ERC20Currency
};
  