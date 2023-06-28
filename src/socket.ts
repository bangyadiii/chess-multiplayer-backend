import { Server, Socket } from "socket.io";

import {
    handleDisconnect,
    handleCallUser,
    handleAcceptCall,
    handlePlayerJoinsGame,
    handleCreateNewGame,
    handleNewMove,
    handleRequestUserName,
    handleReceivedUserName,
    handleEndGame,
} from "./EventHandlers";
import { Event } from "./event/event";

export class ServerSocket {
    private io: Server;

    constructor(io: Server) {
        this.io = io;
    }

    public registerConnectionEvent() {
        this.io.on("connection", (socket: Socket) => {
            console.info("Terhubung dengan socket", socket.id);
            this.registerEventListeners(socket);
        });
    }

    private registerEventListeners(socket: Socket) {
        socket.on(Event.DISCONNECT, handleDisconnect.bind(this, socket));
        socket.on(Event.CALL_USER, handleCallUser.bind(this, socket, this.io));
        socket.on(
            Event.ACCEPT_CALL,
            handleAcceptCall.bind(this, socket, this.io)
        );
        socket.on(
            Event.PLAYER_JOINS_GAME,
            handlePlayerJoinsGame.bind(this, socket, this.io)
        );
        socket.on(
            Event.CREATE_NEW_GAME,
            handleCreateNewGame.bind(this, socket)
        );
        socket.on(
            Event.GAME_END,
            handleEndGame.bind(this, socket)
        );
        socket.on(Event.NEW_MOVE, handleNewMove.bind(this, socket, this.io));
        socket.on(
            Event.REQUEST_USERNAME,
            handleRequestUserName.bind(this, socket, this.io)
        );
        socket.on(
            Event.RECEIVED_USERNAME,
            handleReceivedUserName.bind(this, socket, this.io)
        );
    }
}
