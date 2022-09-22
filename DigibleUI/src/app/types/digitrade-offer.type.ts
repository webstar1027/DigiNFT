
export type digitradeOffer = {
   
        // The addresses and ids are compacted into arrays to ensure optimal blockchain utilization. 
        

        offerId? : string;
        wallets : string[];
        // index 0 = wallet who made the offer (Offerror)
        // 1  = wallet to whom the offer was requested (Offerree)

        addresses?: string[]; 
        // 0 = addressNftOffered1 (ERC721)
        // 1 = addressNftOffered2 (ERC721)
        // 2 = addressTokenOffered (ERC20)

        // 3 = addressNftRequested1 (ERC721)
        // 4 = addressNftRequested2 (ERC721)
        // 5 = addressTokenRequested (ERC20)

        nftTokenIds?:  string[] ;

        // 0 = tokenIdNftOffered1   [if 0 -> then not offered]
        // 1 = tokenIdNftOffered2   [if 0 -> then not offered]

        // 2 = tokenIdNftRequested1 [if 0 -> then not requested]
        // 3 = tokenIdNftRequested2 [if 0 -> then not requested]


        erc20QtyOffered?: string;    // [if 0 -> then not offered]
        erc20QtyRequested?: string;  // [if 0 -> then not requested]
        tradeDone?: boolean;  // Assigned from Smart Contract
        tradeCXL?: boolean; // Assigned from Smart Contract
        processing?: boolean;  // Assigned from smart contract
  
};
