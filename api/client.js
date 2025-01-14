const io = require("socket.io-client");

class Client {
  constructor(serverUrl) {
    this.socket = io(serverUrl);
    this.socket.on("connect", () => {});
  }
  getId() {
    return this.socket.id;
  }

  ImReady() {
    this.socket.emit("ready", null, (response) => {
      console.log(response);
    });
  }
  startGame(player2) {
    this.socket.emit(
      "startGame",
      this.socket.id && { player1: this.socket.id, player2: player2 },
      (response) => {
        console.log(response);
      }
    );
  }
}

module.exports = { Client };
