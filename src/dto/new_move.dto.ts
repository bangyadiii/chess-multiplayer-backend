export interface NewMoveDTOInterface {
    nextPlayerColorToMove: boolean;
    playerColorThatJustMovedIsWhite: boolean;
    selectedId: string;
    finalPosition: number[];
    gameId: string;
}

export class NewMoveDTO {
    public nextPlayerColorToMove: boolean;
    public playerColorThatJustMovedIsWhite: boolean;
    public selectedId: string;
    public finalPosition: number[];
    public gameId: string;

    constructor(payload: NewMoveDTOInterface) {
        this.nextPlayerColorToMove = payload.nextPlayerColorToMove;
        this.playerColorThatJustMovedIsWhite =
            payload.playerColorThatJustMovedIsWhite;
        this.selectedId = payload.selectedId;
        this.finalPosition = payload.finalPosition;
        this.gameId = payload.gameId;
    }
}
