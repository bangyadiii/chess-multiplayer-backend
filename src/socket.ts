import { Server, Socket } from "socket.io";

import {
    handleHandshake,
    handleDisconnect,
    handleCallUser,
    handleAcceptCall,
    handlePlayerJoinsGame,
    handleCreateNewGame,
    handleNewMove,
    handleRequestUserName,
    handleReceivedUserName,
} from "./EventHandlers";

export class ServerSocket {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    public registerConnectionEvent() {
        this.io.on("connect", (socket: Socket) => {
            console.info("Terhubung dengan socket", socket.id);
            this.registerEventListeners(socket);
        });
    }

    private registerEventListeners(socket: Socket) {
        socket.on("handshake", handleHandshake.bind(this, socket, this.io));
        socket.on("disconnect", handleDisconnect.bind(this, socket));
        socket.on("callUser", handleCallUser.bind(this, socket, this.io));
        socket.on("acceptCall", handleAcceptCall.bind(this, socket, this.io));
        socket.on(
            "playerJoinsGame",
            handlePlayerJoinsGame.bind(this, socket, this.io)
        );
        socket.on("createNewGame", handleCreateNewGame.bind(this, socket));
        socket.on("newMove", handleNewMove.bind(this, socket, this.io));
        socket.on(
            "requestUserName",
            handleRequestUserName.bind(this, socket, this.io)
        );
        socket.on(
            "receivedUserName",
            handleReceivedUserName.bind(this, socket, this.io)
        );
    }
}
