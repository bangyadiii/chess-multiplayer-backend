import {Move} from "chess.js"

export interface NewMoveDTO {
    move: Move;
    board: string; // chess.js fen format
    gameId: string;
}
