import { ServerSocket } from "./socket";
import fastify, { FastifyRequest, FastifyReply } from "fastify";
import { instrument } from "@socket.io/admin-ui";
import fastifyIO from "fastify-socket.io";
import fastifyCors from "@fastify/cors";

const server = fastify();

server.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    
})

server.register(fastifyIO, {
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60_000, // 2 minutes
    },
    cors: {
        origin: "*",
    },
});

/**
 * Backend flow:
 * - check to see if the game ID encoded in the URL belongs to a valid game session in progress.
 * - if yes, join the client to that game.
 * - else, create a new game instance.
 * - '/' path should lead to a new game instance.
 * - '/game/:gameid' path should first search for a game instance, then join it. Otherwise, throw 404 error.
 */

server.ready().then(() => {
    // we need to wait for the server to be ready, else `server.io` is undefined
    const socket = new ServerSocket(server.io);
    socket.registerConnectionEvent();
    instrument(server.io, {
        auth: false,
        serverId: "asdasd"
    });
});

// get the gameID encoded in the URL.
// check to see if that gameID matches with all the games currently in session.
// join the existing game session.
// create a new session.
// run when client connects

// usually this is where we try to connect to our DB.
server.listen(
    {
        port: Number(process.env.PORT ?? 9999),
    },
    (err, address) => {
        if (err != null) {
            console.info("ERROR", err);
        }
        console.info("server running on", address);
    }
);
