export interface StatusJoinDTO {
    successToJoin: boolean;
    reason?: string;
    data?: {
        myUsername: string;
        opponentUsername: string;
    };
}
