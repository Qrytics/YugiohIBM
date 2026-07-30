import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = client.handshake?.auth?.token;

    if (!token) {
      throw new WsException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
      });

      // Attach user data to socket for later use
      client.data.userId = payload.sub;
      client.data.email = payload.email;

      return true;
    } catch (error) {
      throw new WsException('Invalid token');
    }
  }
}
