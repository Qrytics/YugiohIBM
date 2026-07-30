import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { GameService } from './game.service';
import { MatchmakingService, MatchPair } from './matchmaking.service';
import { PrismaService } from '../utils/prisma.service';
import { GameAction } from '../game-engine/types';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:3000',
    credentials: true,
  },
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track active matches (matchId -> { player1SocketId, player2SocketId, deckIds, startTime })
  private activeMatches: Map<
    string,
    {
      player1Id: string;
      player2Id: string;
      player1SocketId: string;
      player2SocketId: string;
      deck1Id: string;
      deck2Id: string;
      startTime: number;
    }
  > = new Map();

  // Track which match each socket is in
  private socketToMatch: Map<string, string> = new Map();

  constructor(
    private gameService: GameService,
    private matchmakingService: MatchmakingService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);

    // Validate JWT token
    const token = client.handshake?.auth?.token;
    if (!token) {
      console.log(`Client ${client.id} disconnected: no token`);
      client.disconnect();
      return;
    }

    // Token validation happens in guard, but we do basic check here
    try {
      // The guard will set client.data.userId
      console.log(`Client ${client.id} authenticated`);
    } catch (error) {
      console.log(`Client ${client.id} disconnected: invalid token`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    // Remove from queue if present
    if (client.data.userId) {
      this.matchmakingService.leaveQueue(client.data.userId);
    }

    // Handle match disconnection
    const matchId = this.socketToMatch.get(client.id);
    if (matchId) {
      this.handleMatchDisconnect(matchId, client.id);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('queue:join')
  async handleJoinQueue(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { deckId: string },
  ): Promise<void> {
    const userId = client.data.userId;

    if (!userId) {
      client.emit('game:error', { error: 'Not authenticated' });
      return;
    }

    // Fetch user profile for MMR
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      client.emit('game:error', { error: 'Profile not found' });
      return;
    }

    // Validate deck ownership
    const deck = await this.prisma.deck.findFirst({
      where: { id: data.deckId, userId },
    });

    if (!deck) {
      client.emit('game:error', { error: 'Deck not found or not owned' });
      return;
    }

    // Add to queue
    this.matchmakingService.joinQueue({
      userId,
      socketId: client.id,
      mmr: profile.mmr,
      deckId: data.deckId,
      joinedAt: Date.now(),
    });

    // Try to find match immediately
    const match = this.matchmakingService.findMatch(userId);
    if (match) {
      await this.startMatch(match);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('queue:leave')
  handleLeaveQueue(@ConnectedSocket() client: Socket): void {
    const userId = client.data.userId;
    if (userId) {
      this.matchmakingService.leaveQueue(userId);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('game:action')
  async handleGameAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string; action: GameAction },
  ): Promise<void> {
    const userId = client.data.userId;

    if (!userId) {
      client.emit('game:error', { error: 'Not authenticated' });
      return;
    }

    // Execute action
    const result = await this.gameService.executeAction(
      data.matchId,
      userId,
      data.action,
    );

    if (!result.success) {
      client.emit('game:error', { error: result.error });
      return;
    }

    // Broadcast new state to both players (filtered)
    const matchInfo = this.activeMatches.get(data.matchId);
    if (!matchInfo) return;

    const player1State = this.gameService.filterStateForPlayer(
      result.newState!,
      matchInfo.player1Id,
    );
    const player2State = this.gameService.filterStateForPlayer(
      result.newState!,
      matchInfo.player2Id,
    );

    this.server.to(matchInfo.player1SocketId).emit('game:state', player1State);
    this.server.to(matchInfo.player2SocketId).emit('game:state', player2State);

    // Check for game over
    if (result.newState!.gameOver) {
      await this.handleGameOver(data.matchId, result.newState!);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('game:reconnect')
  async handleReconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ): Promise<void> {
    const userId = client.data.userId;

    if (!userId) {
      client.emit('game:error', { error: 'Not authenticated' });
      return;
    }

    // Get state from Redis
    const state = await this.gameService.getGameState(data.matchId, userId);
    if (!state) {
      client.emit('game:error', { error: 'Match not found or expired' });
      return;
    }

    // Update socket mapping
    const matchInfo = this.activeMatches.get(data.matchId);
    if (matchInfo) {
      if (matchInfo.player1Id === userId) {
        matchInfo.player1SocketId = client.id;
      } else if (matchInfo.player2Id === userId) {
        matchInfo.player2SocketId = client.id;
      }
      this.socketToMatch.set(client.id, data.matchId);
    }

    // Send current state
    client.emit('game:state', state);

    // Notify opponent
    if (matchInfo) {
      const opponentSocketId =
        matchInfo.player1Id === userId
          ? matchInfo.player2SocketId
          : matchInfo.player1SocketId;
      this.server.to(opponentSocketId).emit('opponent:reconnected');
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('game:forfeit')
  async handleForfeit(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { matchId: string },
  ): Promise<void> {
    const userId = client.data.userId;
    if (!userId) return;

    const matchInfo = this.activeMatches.get(data.matchId);
    if (!matchInfo) return;

    // Determine winner (opponent)
    const winnerId =
      matchInfo.player1Id === userId ? matchInfo.player2Id : matchInfo.player1Id;

    // Calculate stats
    const stats = await this.gameService.calculateGameOverStats(
      data.matchId,
      winnerId,
      matchInfo.startTime,
    );

    // Emit game over to both players
    this.server.to(matchInfo.player1SocketId).emit('game:over', {
      ...stats,
      reason: 'forfeit',
    });
    this.server.to(matchInfo.player2SocketId).emit('game:over', {
      ...stats,
      reason: 'forfeit',
    });

    // Update database and clean up
    await this.gameService.endMatch(data.matchId, winnerId, matchInfo.startTime);
    await this.gameService.createMatchRecord(
      data.matchId,
      matchInfo.player1Id,
      matchInfo.player2Id,
      matchInfo.deck1Id,
      matchInfo.deck2Id,
      winnerId,
      stats.duration,
      0, // turns not tracked on forfeit
    );

    this.activeMatches.delete(data.matchId);
    this.socketToMatch.delete(matchInfo.player1SocketId);
    this.socketToMatch.delete(matchInfo.player2SocketId);
  }

  /**
   * Start a match between two players
   */
  private async startMatch(matchPair: MatchPair): Promise<void> {
    const { player1, player2 } = matchPair;

    // Create match
    const { matchId, initialState } = await this.gameService.createMatch(
      player1.userId,
      player2.userId,
      player1.deckId,
      player2.deckId,
    );

    // Track match
    this.activeMatches.set(matchId, {
      player1Id: player1.userId,
      player2Id: player2.userId,
      player1SocketId: player1.socketId,
      player2SocketId: player2.socketId,
      deck1Id: player1.deckId,
      deck2Id: player2.deckId,
      startTime: Date.now(),
    });

    this.socketToMatch.set(player1.socketId, matchId);
    this.socketToMatch.set(player2.socketId, matchId);

    // Get user info
    const [user1, user2, profile1, profile2] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: player1.userId } }),
      this.prisma.user.findUnique({ where: { id: player2.userId } }),
      this.prisma.profile.findUnique({ where: { userId: player1.userId } }),
      this.prisma.profile.findUnique({ where: { userId: player2.userId } }),
    ]);

    // Send match found to player 1
    const player1State = this.gameService.filterStateForPlayer(
      initialState,
      player1.userId,
    );
    this.server.to(player1.socketId).emit('match:found', {
      matchId,
      opponent: {
        id: player2.userId,
        name: user2?.name || 'Player 2',
        rank: profile2?.rank || 'bronze',
        mmr: profile2?.mmr || 1000,
      },
      playerSlot: 0,
      initialState: player1State,
    });

    // Send match found to player 2
    const player2State = this.gameService.filterStateForPlayer(
      initialState,
      player2.userId,
    );
    this.server.to(player2.socketId).emit('match:found', {
      matchId,
      opponent: {
        id: player1.userId,
        name: user1?.name || 'Player 1',
        rank: profile1?.rank || 'bronze',
        mmr: profile1?.mmr || 1000,
      },
      playerSlot: 1,
      initialState: player2State,
    });

    console.log(`Match ${matchId} started between ${player1.userId} and ${player2.userId}`);
  }

  /**
   * Handle game over
   */
  private async handleGameOver(matchId: string, finalState: any): Promise<void> {
    const matchInfo = this.activeMatches.get(matchId);
    if (!matchInfo) return;

    const winnerId =
      finalState.winner === 0 ? matchInfo.player1Id : matchInfo.player2Id;

    // Calculate stats
    const stats = await this.gameService.calculateGameOverStats(
      matchId,
      winnerId,
      matchInfo.startTime,
    );

    // Emit to both players
    this.server.to(matchInfo.player1SocketId).emit('game:over', stats);
    this.server.to(matchInfo.player2SocketId).emit('game:over', stats);

    // Update database
    await this.gameService.endMatch(matchId, winnerId, matchInfo.startTime);
    await this.gameService.createMatchRecord(
      matchId,
      matchInfo.player1Id,
      matchInfo.player2Id,
      matchInfo.deck1Id,
      matchInfo.deck2Id,
      winnerId,
      stats.duration,
      finalState.turn,
    );

    // Clean up
    this.activeMatches.delete(matchId);
    this.socketToMatch.delete(matchInfo.player1SocketId);
    this.socketToMatch.delete(matchInfo.player2SocketId);
  }

  /**
   * Handle player disconnect during match
   */
  private handleMatchDisconnect(matchId: string, socketId: string): void {
    const matchInfo = this.activeMatches.get(matchId);
    if (!matchInfo) return;

    const isPlayer1 = matchInfo.player1SocketId === socketId;
    const disconnectedPlayerId = isPlayer1
      ? matchInfo.player1Id
      : matchInfo.player2Id;
    const opponentSocketId = isPlayer1
      ? matchInfo.player2SocketId
      : matchInfo.player1SocketId;
    const opponentId = isPlayer1
      ? matchInfo.player2Id
      : matchInfo.player1Id;

    // Notify opponent
    this.server.to(opponentSocketId).emit('opponent:disconnected');

    // Start 30-second reconnection timeout
    const timeoutId = setTimeout(async () => {
      // Check if player reconnected
      const currentMatchInfo = this.activeMatches.get(matchId);
      if (!currentMatchInfo) return;

      const stillDisconnected = isPlayer1
        ? !this.socketToMatch.has(currentMatchInfo.player1SocketId)
        : !this.socketToMatch.has(currentMatchInfo.player2SocketId);

      if (stillDisconnected) {
        console.log(
          `Player ${disconnectedPlayerId} failed to reconnect within 30s. Auto-forfeit.`,
        );

        // Auto-forfeit the disconnected player
        try {
          await this.gameService.forfeitMatch(matchId, disconnectedPlayerId);

          // Notify opponent of victory
          this.server.to(opponentSocketId).emit('game:over', {
            winnerId: opponentId,
            reason: 'opponent_disconnect_timeout',
            duration: Math.floor((Date.now() - matchInfo.startTime) / 1000),
          });

          // Clean up
          this.activeMatches.delete(matchId);
          this.socketToMatch.delete(matchInfo.player1SocketId);
          this.socketToMatch.delete(matchInfo.player2SocketId);
        } catch (error) {
          console.error('Error handling disconnect timeout:', error);
        }
      } else {
        console.log(`Player ${disconnectedPlayerId} reconnected successfully`);
      }
    }, 30000); // 30 seconds

    // Store timeout ID in match info for potential cancellation
    matchInfo.disconnectTimeoutId = timeoutId;
  }
}
