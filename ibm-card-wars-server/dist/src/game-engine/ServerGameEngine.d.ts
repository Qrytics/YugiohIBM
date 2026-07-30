import { GameState, Card, GameAction, ActionResult } from './types';
export declare class ServerGameEngine {
    private rng;
    private instanceIdCounter;
    constructor(seed: string);
    initGame(player1Id: string, player1Name: string, deck1: Card[], player2Id: string, player2Name: string, deck2: Card[]): GameState;
    executeAction(state: GameState, action: GameAction): ActionResult;
    private validateAction;
    private validatePlayCard;
    private validateAttack;
    private executePlayCard;
    private playEmployeeCard;
    private executeCardEffect;
    private executeEffect;
    private executeEndTurn;
    private startTurn;
    private drawCard;
    private resolveCombat;
    private dealDamage;
    private damagePlayer;
    private removeDeadCards;
    private executeAttack;
    private executeConcede;
    private checkGameOver;
    private createInitialPlayer;
}
