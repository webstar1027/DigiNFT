import { Component } from '@angular/core';
import { NftService } from 'src/app/services/nft.service';
import { OffchainService } from 'src/app/services/offchain.service';
import { MoralisService } from 'src/app/services/moralis.service';
import { DigiCard } from 'src/app/types/digi-card.types';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  static nftListCached: DigiCard[] = null;
  static lastOffset = 0;

  static cacheUntil: Date = null;
  selectedCar: String;

  filterBy = [
    { name: 'All', id: 'ALL' },
    { name: 'Show Physical', id: 'PHYSICAL' },
    { name: 'Show DIGITAL', id: 'DIGITAL' },
  ];

  nftList: DigiCard[] = null;
  unfilteredNftList: DigiCard[] = null;
  currentOffset = 0;
  loading = false;
  endReached = false;
  typeFilter = 'ALL';
  readonly limit = 30;

  constructor(
    private readonly nft: NftService,
    private readonly offchain: OffchainService,
    private readonly moralis: MoralisService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  async loadData(): Promise<void> {
    if (HomeComponent.cacheUntil > new Date() && HomeComponent.nftListCached) {
      this.nftList = HomeComponent.nftListCached;
      this.currentOffset = HomeComponent.lastOffset;
      this.unfilteredNftList = this.nftList;
      return;
    }
    this.currentOffset = 0;
    this.endReached = false;
    const maticNTFs = await this.moralis.getAllTokensByContractAddressAndNetwork(environment.nftAddressMatic, 'MATIC', this.limit, this.currentOffset)
    const digiCubes = await this.moralis.getAllTokensByContractAddressAndNetwork(environment.nftCubesAddressMatic, 'MATIC', this.limit, this.currentOffset)
    const digiKeys = await this.moralis.getAllTokensByContractAddressAndNetwork(environment.nftKeysAddressMatic, 'MATIC', this.limit, this.currentOffset)
    this.nftList = [...maticNTFs, ...digiCubes, ...digiKeys].sort(() => Math.random() - 0.5);
    this.setCache();
    this.unfilteredNftList = this.nftList;
  }

  async loadMore(): Promise<void> {
    this.loading = true;
    this.currentOffset = this.currentOffset + this.limit;
    const maticNTFs = await this.moralis.getAllTokensByContractAddressAndNetwork(environment.nftAddressMatic, 'MATIC', this.limit, this.currentOffset)
    const digiCubes = await this.moralis.getAllTokensByContractAddressAndNetwork(environment.nftCubesAddressMatic, 'MATIC', this.limit, this.currentOffset)
    const digiKeys = await this.moralis.getAllTokensByContractAddressAndNetwork(environment.nftKeysAddressMatic, 'MATIC', this.limit, this.currentOffset)
    const newNfts = [...maticNTFs, ...digiCubes, ...digiKeys].sort(() => Math.random() - 0.5);

    if (newNfts.length === 0 || newNfts.length < this.limit) {
      this.endReached = true;
    }

    this.unfilteredNftList = [...this.unfilteredNftList, ...newNfts];

    if (this.typeFilter !== 'ALL') {
      this.changeFilter();
    } else {
      this.nftList = this.unfilteredNftList;
    }

    this.setCache();
    this.loading = false;
  }

  changeFilter(): void {
    this.loading = true;
    this.nftList= [];
    setTimeout(async () => {
      if (this.typeFilter === 'ALL') {
        this.nftList = this.unfilteredNftList;
        this.loading = false;
        return;
      }
      const filteredList = [];
      for (const nft of this.unfilteredNftList) {
        let cached = localStorage.getItem('is_physical_' + nft.id);
        if (cached === null) {
          let digiNFTNames = ['Digi Cube NFT', 'Digi NFT', 'Digi Key NFT'];
          if (digiNFTNames.indexOf(nft.name) == -1) {
            cached = '0';
          } else {
            cached = (await this.offchain.getNftData(nft.id, nft.network, nft.token_address)).physical
            ? '1'
            : '0';
          }
          localStorage.setItem('is_physical_' + nft.id, cached);
        }
        if (this.typeFilter === 'PHYSICAL') {
          if (cached === '1') {
            filteredList.push(nft);
          }
        } else {
          if (cached === '0') {
            filteredList.push(nft);
          }
        }
      }
      this.nftList = filteredList;
      if (this.nftList.length === 0 && !this.endReached) {
        this.loadMore();
      }
      this.loading = false;
    }, 200);
  }

  public async handleInput(e) {
    this.loadData();
    var inputValue = (<HTMLInputElement>document.getElementById('searchInp'))
      .value;
    var title = document.getElementsByClassName('section-title');
    var searchBlock = document.getElementById('list-result');
    if (e.code == 'Enter') {
      title[0].innerHTML =
        "<span _ngcontent-fet-c62='' class='icon light'></span> RESULT:";
      searchBlock.innerHTML = '';
      var nftResultList = [];
      for (var i = 0; i < this.nftList.length; i++) {
        var info = await this.offchain.getNftData(this.nftList[i].id, this.nftList[i].network);
        if (
          info['description'].includes(inputValue) ||
          info['name'].includes(inputValue)
        ) {
          nftResultList.push(info);
          //searchBlock.innerHTML += '<app-digi-card id="'+info.id+'" price="" auction=""></app-digi-card>';
        }
      }
      this.nftList = nftResultList;
    }
  }

  private setCache(): void {
    HomeComponent.nftListCached = this.nftList;
    HomeComponent.lastOffset = this.currentOffset;
    const date = new Date();
    date.setMinutes(date.getMinutes() + 30);
    HomeComponent.cacheUntil = date;
  }
}
