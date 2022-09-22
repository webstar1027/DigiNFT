export interface Sale {
  nftContractstring: string;
  tokenId: number;
  owner: string;
  isAuction: boolean;
  minPrice: number;
  fixedPrice: number;
  paymentCurrency: string;
  royalty: boolean;
  endDate: string;
  paymentClaimed: boolean;
  royaltyClaimed: boolean;
  finalPrice: number;
  refunded: boolean;
  available: boolean;
}