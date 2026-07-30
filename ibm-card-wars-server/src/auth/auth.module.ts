import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { WsJwtGuard } from './ws-jwt.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [JwtStrategy, WsJwtGuard],
  exports: [JwtModule, WsJwtGuard],
})
export class AuthModule {}
