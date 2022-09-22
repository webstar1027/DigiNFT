import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { ProfileController } from './profile.controller';
import { AppService } from './app.service';
import { CacheService } from './services/cache.service';
import { MoralisService } from './services/moralis.service';
import { CardController } from './card.controller';
import { ClaimController } from './claim.controller';
import { MediaController } from './media.controller';
import { RegisterController } from './register.controller';
import { EmailService } from './services/email.service';
import { DescriptionsService } from './services/descriptions.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [
    AppController,
    ProfileController,
    CardController,
    MediaController,
    ClaimController,
    RegisterController,
  ],
  providers: [
    AppService,
    CacheService,
    EmailService,
    DescriptionsService,
    MoralisService,
  ],
})
export class AppModule {}
