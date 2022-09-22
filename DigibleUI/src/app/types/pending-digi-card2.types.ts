export type PendingDigiCard2 = {
  tokenId: number;
  network?: string;
  price?: number;
  auction?: boolean;
  saleId: number;
  seller: boolean;
  sold: boolean;
  auctionOrSaleData?: object;
  nftAddress?: string;
  pendingAuction?: boolean;
  tokenData?: object;
};
