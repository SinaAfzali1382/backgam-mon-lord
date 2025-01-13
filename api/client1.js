const io = require("socket.io-client");

// کلاس Client که به صورت مستقل برای هر کلاینت استفاده می‌شود
class Client {
  constructor(serverUrl) {
    this.socket = io(serverUrl);
    this.socket.on("connect", () => {
      console.log(`Client ${this.socket.id} connected to server`);
    });

    // دریافت پیام از سرور یا کلاینت دیگر
    this.socket.on("receive_message", (data) => {
      console.log(`Message from ${data.from}: ${data.message}`);
    });

    // دریافت اعلان اتصال peer-to-peer
    this.socket.on("connect_peer", (peerId) => {
      console.log(`Connected to peer: ${peerId}`);
      this.peerId = peerId;
    });

    // دریافت اعلان قطع اتصال peer-to-peer
    this.socket.on("peer_disconnected", (peerId) => {
      console.log(`Peer ${peerId} disconnected`);
      this.peerId = null;
    });

    // دریافت پیام قطع ارتباط
    this.socket.on("disconnected", (peerId) => {
      console.log(`Disconnected from peer: ${peerId}`);
    });

    // دریافت پیام برودکست شده از سرور
    this.socket.on("broadcast_message", (data) => {
      console.log(`Broadcast from ${data.from}: ${data.message}`);
    });
  }

  // ارسال پیام به سرور
  sendMessageToServer(message) {
    this.socket.emit("send_message_to_server", message);
  }

  // ارسال پیام به هم‌تیمی از طریق peer-to-peer
  sendMessageToPeer(message) {
    if (this.peerId) {
      this.socket.emit("send_message", message);
    } else {
      console.log("Peer connection not established yet");
    }
  }

  // درخواست شروع ارتباط با کلاینت دیگر
  startConnection() {
    this.socket.emit("start");
  }

  // قطع ارتباط با کلاینت دیگر
  finishConnection(peerId) {
    this.socket.emit("finish", peerId);
  }
}

// ایجاد چند کلاینت
const client1 = new Client("http://localhost:3000");
const client2 = new Client("http://localhost:3000");
const client3 = new Client("http://localhost:3000");

// شروع اتصال برای client1 و client2
client1.startConnection();
client2.startConnection();

// ارسال پیام از client1 به سرور
client1.sendMessageToServer("Hello from client 1 to server");

// ارسال پیام از client2 به سرور
client2.sendMessageToServer("Hello from client 2 to server");

// ارسال پیام از client1 به client2 پس از اتصال
setTimeout(() => {
  client1.sendMessageToPeer("Hello from client 1 to client 2");
}, 2000);

// قطع ارتباط از طرف client1
setTimeout(() => {
  client1.finishConnection(client2.socket.id);
}, 5000);
