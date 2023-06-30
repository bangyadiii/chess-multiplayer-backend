import { Server, Socket } from "socket.io";
import { Event } from "./event/event";
import { StatusJoinDTO } from "./dto/status.dto";
import { NewMoveDTO } from "./dto/new_move.dto";
import { Chess, ChessInstance } from "chess.js";

export interface GameSession {
    roomId: string;
    gameInstance: ChessInstance;
    players: Record<string, string>;
}

const gameSessions: Map<string, GameSession> = new Map();

export function handleDisconnect(socket: Socket, reason: any) {
    console.info("[DISCONNECTED] Socket ID:", socket.id, "=> reason:", reason);
}

export function handleCallUser(socket: Socket, io: Server, data: any) {
    io.to(data.userToCall).emit(Event.HEY, {
        signal: data.signalData,
        from: data.from,
    });
}

export function handleAcceptCall(socket: Socket, io: Server, data: any) {
    io.to(data.to).emit(Event.CALL_ACCEPTED, data.signal);
}

export function handleEndGame(socket: Socket, io: Server, gameId: string) {
    socket.leave(gameId);
    console.debug("Room size:", io.sockets.adapter.rooms.get(gameId)?.size);
}

export interface JoinGameRequest {
    gameId: string;
    userName: string;
    isCreator: boolean;
    socketId?: string;
}

export function handlePlayerJoinsGame(
    socket: Socket,
    io: Server,
    payload: JoinGameRequest
) {
    const room = io.sockets.adapter.rooms.get(payload.gameId);

    if (room === undefined) {
        const statusData: StatusJoinDTO = {
            successToJoin: false,
            reason: "GAME_SESSION.NOT_FOUND",
        };
        socket.emit(Event.JOIN_STATUS, statusData);
        return;
    }

    const gameSession = gameSessions.get(payload.gameId);

    if (gameSession !== undefined) {
        gameSession.players.player2 = socket.id;
        gameSessions.set(payload.gameId, gameSession);
    }

    if (room.size < 2) {
        payload.socketId = socket.id;
        socket.join(payload.gameId);

        io.sockets.in(payload.gameId).emit(Event.PLAYER_JOINED_ROOM, payload);
    } else {
        const statusData: StatusJoinDTO = {
            successToJoin: false,
            reason: "GAME_SESSION.FULL",
        };

        socket.emit(Event.JOIN_STATUS, statusData);
    }

    console.debug("Room size:", room.size);
}

export async function handleCreateNewGame(
    socket: Socket,
    io: Server,
    gameId: string
) {
    const playerId = socket.id;

    const session: GameSession = {
        roomId: gameId,
        gameInstance: new Chess(),
        players: {
            player1: playerId,
        },
    };
    gameSessions.set(gameId, session);

    socket.join(gameId);

}

export function handleNewMove(socket: Socket, io: Server, payload: NewMoveDTO) {
    console.log("payload", payload);
    io.to(payload.gameId).emit(Event.OPPONENT_MOVE, payload.move);
}

export function handleRequestUserName(socket: Socket, io: Server, gameId: any) {
    io.to(gameId).emit(Event.GIVE_USERNAME, socket.id);
}

export function handleReceivedUserName(socket: Socket, io: Server, data: any) {
    data.socketId = socket.id;
    io.to(data.gameId).emit(Event.GET_OPPONENT_USERNAME, data);
}

// export function handleHandshake(
//     socket: Socket,
//     io: Server,
//     callback: (uid: string, users: string[]) => void
// ) {
//     const playerId = socket.id;

//     const gameSession: GameSession = {
//         gameId,
//         players: {
//             [playerId]: "",
//         },
//     };

//     socket.join(gameId);

//     socket.emit(Event.HANDSHAKE, gameId, playerId);
//     // Check if this is a reconnection
//     const room = io.sockets.adapter.rooms.get(gameId);
//     const reconnected = room && room.has(playerId);
//     // Chech if this is a reconnection
//     if (reconnected) {
//         console.info("Pemain ini telah terhubung kembali.");
//         const users = Object.values(gameSession.players);

//         callback(playerId, users);
//     }
// }
