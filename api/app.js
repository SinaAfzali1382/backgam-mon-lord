const { player } = require("./enums");
const { Game, Player } = require("./utilities");
const express = require("express");
const cors = require("cors");
const { Client } = require("./client");
const app = express();
const port = 5000;

let waitingPlayers = [];
let Games = [];
let myClients = [];

const io = require("socket.io")(3001, {
  cors: { origin: "*" },
});

//////////////////  api //////////////////////////
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.get("/player/waiting/:id", (req, res) => {
  const playerId = req.params.id;
  res.json(waitingPlayers.filter((player) => player !== playerId));
});
app.get("/player/game/status/:id", (req, res) => {
  const playerId = req.params.id;
  if (
    Games.filter(
      (game) => game.player1.id === playerId || game.player2.id === playerId
    ).length > 0
  ) {
    res.json(true);
  } else res.json(false);
});
app.get("/player/online", (req, res) => {
  const client = new Client("http://localhost:4000");
  myClients.push(client);
  client.ImReady();
  setTimeout(() => {
    res.json(String(client.getId()));
  }, 200);
});
app.get("/player/startGame/:player1/:player2", (req, res) => {
  const player1 = req.params.player1;
  const player2 = req.params.player2;
  const client1 = myClients.filter((player) => player.getId() === player1)[0];
  client1.startGame(player2);
  res.json(null);
});

app.get("/game/rollDice/:id/", (req, res) => {
  const playerId = req.params.id;
  const currGame = Games.filter(
    (game) => game.player1.id === playerId || game.player2.id === playerId
  );
  if (currGame[0] && currGame[0].currentPlayer.isFinish()) {
    currGame[0].currentPlayer.getName() === 1
      ? (currGame[0].currentPlayer = currGame[0].player2)
      : (currGame[0].currentPlayer = currGame[0].player1);
    currGame[0].currentPlayer.rollTheDice();
    res.json(currGame[0]);
  }
  res.json(currGame[0]);
});
app.get("/game/all/info/:id/", (req, res) => {
  const playerId = req.params.id;
  const currGame = Games.filter(
    (game) => game.player1.id === playerId || game.player2.id === playerId
  );
  res.json(currGame[0]);
});

app.get("/game/validHome/:id/:numberHome/", (req, res) => {
  const playerId = req.params.id;
  const numberHome = req.params.numberHome;
  const currGame = Games.filter(
    (game) =>
      (game.player1.id === playerId || game.player2.id === playerId) &&
      game.currentPlayer.id === playerId
  );
  let result = currGame[0]
    .myHouses(currGame[0].currentPlayer.name)
    .includes(Number(numberHome));
  res.json(result);
});
app.get("/game/destinations/:id/:numberHome/", (req, res) => {
  const playerId = req.params.id;
  const numberHome = req.params.numberHome;
  const currGame = Games.filter(
    (game) =>
      (game.player1.id === playerId || game.player2.id === playerId) &&
      game.currentPlayer.id === playerId
  );
  let dest = currGame[0].currentPlayer.destinations(Number(numberHome));
  dest = dest.filter(
    (item) =>
      !currGame[0].closedHouses(currGame[0].currentPlayer.name).includes(item)
  );
  res.json(dest);
});
app.get("/game/move/:id/:source/:dest/", (req, res) => {
  const playerId = req.params.id;
  let source = req.params.source;
  let dest = req.params.dest;
  source = Number(source);
  dest = Number(dest);
  const currGame = Games.filter(
    (game) =>
      (game.player1.id === playerId || game.player2.id === playerId) &&
      game.currentPlayer.id === playerId
  );
  let dest2 = currGame[0].currentPlayer.destinations(Number(source));
  dest2 = dest2.filter(
    (item) =>
      !currGame[0].closedHouses(currGame[0].currentPlayer.name).includes(item)
  );
  dest2 = dest2.filter((item) => item === dest);
  if (dest2?.length > 0) {
    if (currGame[0].player1.id === playerId) {
      let pices = currGame[0].player1.getPices();
      pices[source] = pices[source] - 1;
      pices[dest] = pices[dest] + 1;
      currGame[0].player1.setPieces(pices);
      currGame[0].setPices();
      currGame[0].player1.updateDice(Math.abs(dest - source));
    } else if (currGame[0].player2.id === playerId) {
      let pices = currGame[0].player2.getPices();
      pices[source] = pices[source] - 1;
      pices[dest] = pices[dest] + 1;
      currGame[0].player2.setPieces(pices);
      currGame[0].setPices();
      currGame[0].player2.updateDice(Math.abs(dest - source));
    }
  }
  res.json(currGame);
});
/////////////////////  end api  ///////////////////////////////

io.on("connection", (socket) => {
  console.log(`Server connected: ${socket.id}`);

  socket.on("ready", (data, callback) => {
    // بازگرداندن آیدی کلاینت
    waitingPlayers.push(data);
    callback("player with id : " + data + " is Online");
  });
  socket.on("startGame", (data, callback) => {
    // بازگرداندن آیدی کلاینت
    if (waitingPlayers.length >= 2) {
      const newGame = new Game(
        new Player(player.white, data.player1),
        new Player(player.black, data.player2)
      );
      Games.push(newGame);
      waitingPlayers = waitingPlayers.filter(
        (item) => item !== data.player1 && item !== data.player2
      );
      callback("player " + data.player1 + " play with " + data.player2);
    } else {
      callback("any player is not exist to create game");
    }
  });
  socket.on("disconnect", () => {
    console.log(`Server disconnected: ${socket.id}`);
  });
});

console.log("Server running on port 3001");
app.listen(port, () => {
  console.log(`Server api running at http://localhost:${port}`);
});
