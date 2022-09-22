export type Receipt = {
  blockHash: string;
  blockNumber: number;
  contractAddress?: null;
  cumulativeGasUsed: number;
  effectiveGasPrice: string;
  from: string;
  gasUsed: number;
  logsBloom: string;
  status: boolean;
  to: string;
  transactionHash: string;
  transactionIndex: number;
  type: string;
  events: ReceiptEvents;
};

export type WalletReceipt = {
  code: number;
  message: string;
  stack: string;
}

export type ReceiptEvents = {
  Transfer: TransferEvent;
};
export type TransferEvent = {
  address: string;
  blockHash: string;
  blockNumber: number;
  logIndex: number;
  removed: boolean;
  transactionHash: string;
  transactionIndex: number;
  id: string;
  returnValues: TransferReturnValues;
  event: string;
  signature: string;
  raw: TransferRaw;
};
export type TransferReturnValues = {
  0: string;
  1: string;
  2: string;
  from: string;
  to: string;
  tokenId: string;
};
export type TransferRaw = {
  data: string;
  topics?: (string)[] | null;
};

