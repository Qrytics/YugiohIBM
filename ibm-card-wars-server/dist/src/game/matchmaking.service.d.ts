export interface QueueEntry {
    userId: string;
    socketId: string;
    mmr: number;
    deckId: string;
    joinedAt: number;
}
export interface MatchPair {
    player1: QueueEntry;
    player2: QueueEntry;
}
export declare class MatchmakingService {
    private queue;
    joinQueue(entry: QueueEntry): void;
    leaveQueue(userId: string): void;
    findMatch(userId: string): MatchPair | null;
    getQueueSize(): number;
    getEntry(userId: string): QueueEntry | undefined;
    isInQueue(userId: string): boolean;
    clearQueue(): void;
}
