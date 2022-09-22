interface NftDataAttribute {
  trait_type: string,
  value: string,
}

interface NftData {
  name?: string,
  description?: string,
  image?: any,
  physical?: boolean | undefined,
  attributes?: NftDataAttribute[],
  fileName?: string,
  isVideo?: boolean,
  tokenUri?: string,
  qty?: number,
}
