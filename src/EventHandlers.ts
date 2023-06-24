import { Server, Socket } from "socket.io";
import { v4 as uuid } from "uuid";

export interface GameSession {
    gameId: string;
    players: {
        [playerId: string]: string;
    };
}

export function handleHandshake(
    socket: Socket,
    io: Server,
    callback: (uid: string, users: string[]) => void
) {
    console.info("Handshake diterima dari", socket.id);

    const gameId = uuid();
    const playerId = socket.id;

    const gameSession: GameSession = {
        gameId,
        players: {
            [playerId]: "",
        },
    };

    socket.join(gameId);

    socket.emit("handshake", gameId, playerId);
    // Chech if this is a reconnection
    const room = io.sockets.adapter.rooms.get(gameId);
    const reconnected = room && room.has(playerId);
    // Chech if this is a reconnection
    if (reconnected) {
        console.info("Pemain ini telah terhubung kembali.");
        const users = Object.values(gameSession.players);

        callback(playerId, users);
    }
}

export function handleDisconnect(socket: Socket) {
    console.info("Client terputus", socket.id);
}

export function handleCallUser(socket: Socket, io: Server, data: any) {
    io.to(data.userToCall).emit("hey", {
        signal: data.signalData,
        from: data.from,
    });
}

export function handleAcceptCall(socket: Socket, io: Server, data: any) {
    io.to(data.to).emit("callAccepted", data.signal);
}

export function handlePlayerJoinsGame(socket: Socket, io: Server, idData: any) {
    const room = io.sockets.adapter.rooms.get(idData.gameId);

    if (room === undefined) {
        socket.emit("status", "Sesi permainan ini tidak ada.");
        return;
    }

    if (room.size < 2) {
        idData.mySocketId = socket.id;

        socket.join(idData.gameId);

        console.log(room.size);

        if (room.size === 2) {
            io.sockets.in(idData.gameId).emit("start game", idData.userName);
        }

        io.sockets.in(idData.gameId).emit("playerJoinedRoom", idData);
    } else {
        socket.emit(
            "status",
            "Sudah ada 2 orang yang sedang bermain di ruangan ini."
        );
    }
}

export function handleCreateNewGame(socket: Socket, gameId: any) {
    socket.emit("createNewGame", { gameId, mySocketId: socket.id });

    socket.join(gameId);
}

export function handleNewMove(socket: Socket, io: Server, move: any) {
    const gameId = move.gameId;

    io.to(gameId).emit("opponent move", move);
}

export function handleRequestUserName(socket: Socket, io: Server, gameId: any) {
    io.to(gameId).emit("give userName", socket.id);
}

export function handleReceivedUserName(socket: Socket, io: Server, data: any) {
    data.socketId = socket.id;
    io.to(data.gameId).emit("get Opponent UserName", data);
}
