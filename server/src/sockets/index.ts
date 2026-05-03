import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../logger/logger';

export const initSockets = (httpServer: HttpServer): Server => {
    const io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id}`);
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
}