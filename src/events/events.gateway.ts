import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { EventType } from './types';
import { JoinGameRequest, NewMoveDTO, StatusJoinDTO } from './dto/dto';
import { GameSession } from './game.model';
import { Chess } from 'chess.js';
import { GameState } from './constant/game_state';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  private io: Server;

  private gameSessions: Map<string, GameSession> = new Map();

  @SubscribeMessage(EventType.DISCONNECT)
  handleDisconnect(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: string,
  ): void {
    console.info('[DISCONNECTED] Socket ID', client.id);
  }

  @SubscribeMessage(EventType.PLAYER_JOINS_GAME)
  handlePlayerJoinsGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinGameRequest,
  ): void {
    const room = this.io.sockets.adapter.rooms.get(data.gameId);

    if (room === undefined) {
      const statusData: StatusJoinDTO = {
        successToJoin: false,
        reason: GameState.NOT_FOUND,
      };

      client.emit(EventType.JOIN_STATUS, statusData);
      return;
    }

    const gameSession = this.gameSessions.get(data.gameId);

    if (gameSession !== undefined) {
      gameSession.players.player2 = client.id;
      this.gameSessions.set(data.gameId, gameSession);
    }

    if (room.size < 2) {
      data.socketId = client.id;
      client.join(data.gameId);

      client.to(data.gameId).emit(EventType.PLAYER_JOINED_ROOM, data);
    } else {
      const statusData: StatusJoinDTO = {
        successToJoin: false,
        reason: GameState.FULL,
      };
      client.emit(EventType.JOIN_STATUS, statusData);
    }
  }

  @SubscribeMessage(EventType.CREATE_NEW_GAME)
  handleCreateNewGame(
    @ConnectedSocket() client: Socket,
    @MessageBody('gameId') gameId: string,
  ): void {
    console.debug('gameId', gameId);
    const playerId = client.id;

    const session: GameSession = {
      roomId: gameId,
      gameInstance: new Chess(),
      players: {
        player1: playerId,
      },
    };

    this.gameSessions.set(gameId, session);
    client.join(gameId);
  }

  @SubscribeMessage(EventType.NEW_MOVE)
  handleNewMove(@ConnectedSocket() client: Socket, payload: NewMoveDTO) {
    client.to(payload.gameId).emit(EventType.OPPONENT_MOVE, payload);
  }

  @SubscribeMessage(EventType.GAME_END)
  handleEndGame(
    @ConnectedSocket() client: Socket,
    @MessageBody('gameId') gameId: string,
  ) {
    client.leave(gameId);
  }
}
