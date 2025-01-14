const io = require("socket.io")(process.env.PORT, {
  cors: { origin: "*" },
});
socketPool = {};
const getSocketToNext = (port) => {
  if (!socketPool[port]) {
    socketPool[port] = require("socket.io-client")(port);
    console.log(`Created new connection to ${port}`);
  }
  return socketPool[port];
};
const getNextPort = (port) => {
  let nextPort = Number(port);
  if (nextPort !== 4002 && nextPort !== 3001) nextPort += 1;
  else if (nextPort !== 3001) nextPort = 3001;
  else nextPort = null;
  return nextPort;
};
io.on("connection", (socket) => {
  console.log(`Router connected: ${socket.id}`);

  socket.on("ready", (data, callback) => {
    let nextPort = getNextPort(Number(process.env.PORT));
    if (nextPort) {
      const nextSocket = getSocketToNext("http://localhost:" + nextPort);
      nextSocket.emit(
        "ready",
        nextPort === 4001 ? String(socket.id) : data,
        (response) => {
          callback(response);
        }
      );
    }
  });
  socket.on("startGame", (data, callback) => {
    let nextPort = getNextPort(Number(process.env.PORT));
    if (nextPort) {
      const nextSocket = getSocketToNext("http://localhost:" + nextPort);
      nextSocket.emit("startGame", data, (response) => {
        callback(response);
      });
    }
  });

  socket.on("disconnect", () => {
    console.log(`Router disconnected: ${socket.id}`);
  });
});

console.log(`Router running on port ${process.env.PORT}`);
