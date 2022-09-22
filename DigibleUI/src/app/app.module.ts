import { DatePipe, CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BrowserModule } from '@angular/platform-browser';
import { AccordionModule } from 'ngx-accordion';
import {
  DlDateTimeDateModule,
  DlDateTimePickerModule,
} from 'angular-bootstrap-datetimepicker';
import { NgxFileDropModule } from 'ngx-file-drop';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SafePipe } from './safe.pipe';
import { AdminComponent } from './components/admin/admin.component';
import { AuctionsComponent } from './components/auctions/auctions.component';
import { ClaimCardComponent } from './components/claim-card/claim-card.component';
import { CreateAuctionComponent } from './components/create-auction/create-auction.component';
import { CreateCardComponent } from './components/create-card/create-card.component';
import { CreateCardComponentLOI } from './components/create-card/loi/create-card-loi.component';
import { CreateMultiCardComponent } from './components/create-multi-card/create-multicard.component';
import { CreateMultiCardComponentLoi } from './components/create-multi-card/loi/create-multicard-loi.component';
import { CreateTypeComponent } from './components/create-type/create-type.component';
import { CreateSellPriceComponent } from './components/create-sell-price/create-sell-price.component';
import { CreateSellComponent } from './components/create-sell/create-sell.component';
import { DetailsComponent } from './components/details/details.component';
import { DigiWaxComponent } from './components/digiwax/digiwax.component';
import { DuelDetailsComponent } from './components/duel-details/duel-details.component';
import { DuelsComponent } from './components/duels/duels.component';
import { ExplorerComponent } from './components/explorer/explorer.component';
import { HomeComponent } from './components/home/home.component';
import { NewestComponent } from './components/newest/newest.component';
import { PrivateSaleComponent } from './components/private-sale/private-sale.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RankingsComponent } from './components/rankings/rankings.component';
import { SearchComponent } from './components/search/search.component';
import { StakingComponent } from './components/staking/staking.component';
import { LayoutComponent } from './layout/layout.component';
import { DigiCardComponent } from './partials/digi-card/digi-card.component';
import { MoralisCardComponent } from './partials/moralis-card/moralis-card.component';
import { LoadingBlockchainComponent } from './partials/loading-blockchain/loading-blockchain.component';
import { LoadingComponent } from './partials/loading/loading.component';
import { StakeComponent } from './partials/stake/stake.component';
import { DuelsService } from './services/duels.service';
import { MarketplaceService } from './services/marketplace.service';
import { MathService } from './services/math.service';
// import { MaticService } from './services/matic.service';
import { NftService } from './services/nft.service';
import { OffchainService } from './services/offchain.service';
import { DigiWaxService } from './services/digiwax.service';
import { MoralisService } from './services/moralis.service';
import { StakingService } from './services/staking.service';
import { TokensService } from './services/tokens.service';
import { VerifiedWalletsService } from './services/verified-wallets.service';
import { WalletService } from './services/wallet.service';
import { FormService } from './services/form.service';
import { CollectionsComponent } from './components/collections/collections.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { FaqComponent } from './components/about/faq/faq.component';
import { PurchaseComponent } from './components/purchase/purchase.component';
import { CountdownModule } from 'ngx-countdown';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
} from '@angular/platform-browser/animations';
import { NgxImageZoomModule } from 'ngx-image-zoom';
import { HelpersService } from './services/helpers.service';
import { TruncatePipe } from './helpers/truncate.pipe';
import {
  HttpClientJsonpModule,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { HttpErrorInterceptor } from './http-error.interceptor';
import { ReactiveFormsModule } from '@angular/forms';
import { StakingV2Component } from './components/staking-v2/staking-v2.component';
import { StakeV2Component } from './partials/stake-v2/stake-v2.component';
import { TradeComponent } from './components/trade/trade.component';
import { DigiTrackService } from './services/digitrack.service';
import { MarketplaceAndAuctionService } from './services/marketandauction.service';
import { CoinListService } from './services/coinlist.service';
import { NgImageFullscreenViewModule } from 'ng-image-fullscreen-view';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import {IvyCarouselModule} from 'angular-responsive-carousel';
import { DigiCardSaleComponent } from './partials/digi-card-sale/digi-card-sale.component';
import { DigiTradeService } from './services/digitrade.service';
import { UkraineMintService } from './services/ukrainemint.service';
import { UkraineComponent } from './components/ukraine/ukraine.component';
import { DigiService } from './services/digi.service';



const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
};

@NgModule({
  declarations: [
    SafePipe,
    AppComponent,
    ExplorerComponent,
    NewestComponent,
    DigiCardComponent,
    MoralisCardComponent,
    HomeComponent,
    LayoutComponent,
    LeaderboardComponent,
    LoadingComponent,
    LoadingBlockchainComponent,
    AuctionsComponent,
    RankingsComponent,
    DigiWaxComponent,
    ProfileComponent,
    PurchaseComponent,
    DetailsComponent,
    CreateSellComponent,
    CreateSellPriceComponent,
    CreateCardComponent,
    CreateCardComponentLOI,
    CreateMultiCardComponent,
    CreateMultiCardComponentLoi,
    CreateTypeComponent,
    CreateAuctionComponent,
    DuelsComponent,
    DuelDetailsComponent,
    PrivateSaleComponent,
    ClaimCardComponent,
    AdminComponent,
    SearchComponent,
    StakeComponent,
    StakingComponent,
    CollectionsComponent,
    FaqComponent,
    TruncatePipe,
    StakingV2Component,
    StakeV2Component,
    TradeComponent,
    DigiCardSaleComponent,
    UkraineComponent,
   
  ],
  imports: [
    BrowserModule,
    CountdownModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    NgxFileDropModule,
    DlDateTimeDateModule,
    DlDateTimePickerModule,
    NgSelectModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    NgxImageZoomModule,
    AccordionModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgImageFullscreenViewModule,
    PerfectScrollbarModule,
    AutocompleteLibModule,
    IvyCarouselModule
  ],
  providers: [
    DatePipe,
    WalletService,
    OffchainService,
    NftService,
    MoralisService,
    MathService,
    DigiWaxService,
    MarketplaceService,
    TokensService,
    DuelsService,
    StakingService,
    VerifiedWalletsService,
    HelpersService,
    DigiTrackService,
    MarketplaceAndAuctionService,
    CoinListService,
    DigiTradeService,
    UkraineMintService,
    FormService,
    DigiService,
    
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
