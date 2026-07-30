import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { MatchmakingService } from './matchmaking.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../utils/prisma.service';

@Module({
  imports: [AuthModule],
  providers: [GameGateway, GameService, MatchmakingService, PrismaService],
  exports: [GameService, MatchmakingService],
})
export class GameModule {}
