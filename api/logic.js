const client1 = new Client("http://localhost:4000");
const client2 = new Client("http://localhost:4000");
client1.ImReady();
client2.ImReady();
setTimeout(() => {
  client1.startGame(client2.getId());
}, 200);

