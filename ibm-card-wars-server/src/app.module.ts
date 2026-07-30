import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { PrismaService } from './utils/prisma.service';

@Module({
  imports: [RedisModule, AuthModule, GameModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
