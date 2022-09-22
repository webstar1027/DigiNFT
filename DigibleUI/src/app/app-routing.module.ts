import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './components/admin/admin.component';
import { AuctionsComponent } from './components/auctions/auctions.component';
import { ClaimCardComponent } from './components/claim-card/claim-card.component';
import { CollectionsComponent } from './components/collections/collections.component';
import { CreateAuctionComponent } from './components/create-auction/create-auction.component';
import { CreateCardComponent } from './components/create-card/create-card.component';
import { CreateMultiCardComponent } from './components/create-multi-card/create-multicard.component';
import { CreateTypeComponent } from './components/create-type/create-type.component';
import { CreateSellPriceComponent } from './components/create-sell-price/create-sell-price.component';
import { CreateSellComponent } from './components/create-sell/create-sell.component';
import { DetailsComponent } from './components/details/details.component';
import { DuelDetailsComponent } from './components/duel-details/duel-details.component';
import { DuelsComponent } from './components/duels/duels.component';
import { ExplorerComponent } from './components/explorer/explorer.component';
import { DigiWaxComponent } from './components/digiwax/digiwax.component';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { HomeComponent } from './components/home/home.component';
import { PrivateSaleComponent } from './components/private-sale/private-sale.component';
import { ProfileComponent } from './components/profile/profile.component';
import { RankingsComponent } from './components/rankings/rankings.component';
import { SearchComponent } from './components/search/search.component';
import { StakingComponent } from './components/staking/staking.component';
import { TradeComponent } from './components/trade/trade.component';
import { StakingV2Component } from './components/staking-v2/staking-v2.component';
import { UkraineComponent } from './components/ukraine/ukraine.component';




// About page components
import { AboutDigiTeamComponent } from './components/about/digi-team/digi-team.component';
import { AboutDigiDuelComponent } from './components/about/digi-duel/digi-duel.component';
import { AboutDigiFarmComponent } from './components/about/digi-farm/digi-farm.component';
import { AboutDigiSafeComponent } from './components/about/digi-safe/digi-safe.component';
import { AboutDigiGradeComponent } from './components/about/digi-grade/digi-grade.component';
import { AboutDigiTrackComponent } from './components/about/digi-track/digi-track.component';
import { AboutDigiRoadMapComponent } from './components/about/road-map/digi-road-map.component';

import { FaqComponent } from './components/about/faq/faq.component';
import { TermsAndConditionsComponent } from './components/about/terms-and-conditions/terms-and-conditions.component';
import { PrivacyPolicyComponent } from './components/about/privacy-policy/privacy-policy.component';

import { LayoutComponent } from './layout/layout.component';
import { PurchaseComponent } from './components/purchase/purchase.component';


//Special Components
import { CreateCardComponentLOI } from './components/create-card/loi/create-card-loi.component';
import { CreateMultiCardComponentLoi } from './components/create-multi-card/loi/create-multicard-loi.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'stake-v2',
        component: StakingV2Component,
      },
      {
        path: 'trade',
        component: TradeComponent,
      },
      {
        path: 'digiwax/:network/:boxName',
        component: DigiWaxComponent,
      },
      {
        path: 'collections',
        component: CollectionsComponent,
      },
      {
        path: 'collections/leaderboard',
        component: LeaderboardComponent,
      },
      {
        path: 'search',
        component: SearchComponent,
      },
      {
        path: 'for-sale',
        component: ExplorerComponent,
      },
      {
        path: 'for-sale/create',
        component: CreateSellComponent,
      },
      {
        path: 'for-sale/create/:network/:tokenAddress/:id',
        component: CreateSellPriceComponent,
      },
      {
        path: 'purchase',
        component: PurchaseComponent,
      },
      {
        path: 'stake',
        component: StakingComponent,
      },
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'sale',
        component: PrivateSaleComponent,
      },
      {
        path: 'auctions',
        component: AuctionsComponent,
      },
      {
        path: 'auctions/create/:network/:id/:tokenAddress',
        component: CreateAuctionComponent,
      },
      {
        path: 'rankings',
        component: RankingsComponent,
      },
      {
        path: 'details/:network/:id/:tokenAddress',
        component: DetailsComponent,
      },
      {
        path: 'claim/:id',
        component: ClaimCardComponent,
      },
      {
        path: 'profile/:address',
        component: ProfileComponent,
      },
      {
        path: 'create',
        component: CreateTypeComponent,
      },
      {
        path: 'create/single',
        component: CreateCardComponent,
      },
      {
        path: 'create/single/loi',
        component: CreateCardComponentLOI,
      },
      {
        path: 'create/multiple',
        component: CreateMultiCardComponent,
      },
      {
        path: 'create/multiple/loi',
        component: CreateMultiCardComponentLoi,
      },
      {
        path: 'duels',
        component: DuelsComponent,
      },
      {
        path: 'duel/:id',
        component: DuelDetailsComponent,
      },
      {
        path: 'admin',
        component: AdminComponent,
      },
      {
        path: 'digi-team',
        component: AboutDigiTeamComponent,
      },
      {
        path: 'digi-duel',
        component: AboutDigiDuelComponent,
      },
      {
        path: 'digi-farm',
        component: AboutDigiFarmComponent,
      },
      {
        path: 'digi-safe',
        component: AboutDigiSafeComponent,
      },
      {
        path: 'digi-grade',
        component: AboutDigiGradeComponent,
      },
      {
        path: 'digi-track',
        component: AboutDigiTrackComponent,
      },
      {
        path: 'digi-road-map',
        component: AboutDigiRoadMapComponent,
      },
      {
        path: 'faq',
        component: FaqComponent,
      },
      {
        path: 'terms-and-conditions',
        component: TermsAndConditionsComponent,
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
      },
      { path: 'standwithukraine/:network',
        component: UkraineComponent

      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
