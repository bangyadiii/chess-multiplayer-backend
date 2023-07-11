import { ChessInstance } from 'chess.js';

export interface GameSession {
  roomId: string;
  gameInstance: ChessInstance;
  players: Record<string, string>;
}
