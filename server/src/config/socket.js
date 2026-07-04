const { Server } = require('socket.io');

let io = null;

const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL]
  .filter(Boolean)
  .map((url) => url.replace(/\/$/, ''));

function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || /^https?:\/\/localhost:\d+$/.test(origin)) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    },
  });
  return io;
}

function emitEvent(event, payload) {
  if (io) io.emit(event, payload);
}

module.exports = { initSocket, emitEvent };
