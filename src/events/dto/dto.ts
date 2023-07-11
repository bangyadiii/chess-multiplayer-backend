import { Move } from 'chess.js';

export interface JoinGameRequest {
  gameId: string;
  userName: string;
  isCreator: boolean;
  socketId?: string;
}

export interface StatusJoinDTO {
  successToJoin: boolean;
  reason?: string;
  data?: {
    myUsername: string;
    opponentUsername: string;
  };
}

export interface NewMoveDTO {
  move: Move;
  board: string; // chess.js fen format
  gameId: string;
}
