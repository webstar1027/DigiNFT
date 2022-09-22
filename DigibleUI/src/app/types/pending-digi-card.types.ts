export type PendingDigiCard = {
  id: number;
  network?: string;
  price?: number;
  auction?: boolean;
  auctionId: number;
  seller: boolean;
  sold: boolean;
  auctionOrSaleData?: object;
  nftAddress?: string;
  pendingAuction?: boolean;
  tokenData?: object;
};
