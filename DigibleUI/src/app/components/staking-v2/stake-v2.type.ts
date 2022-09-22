export type StakeV2 = {
  address: string;
  name: string;
  icon: string;
  stakeAddress: string;
  decimals: number;
  reward: string; 
  apr: number;
  lockupMonths; 
  poolOperStartDate: Date;
  poolOpenEndDate: Date;
  poolUnlockDate: Date;
  publicComment: string;
};

