// Dependencies
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

// Server setup
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// مپ برای نگهداری کلاینت‌ها و ارتباطات
const clients = new Map();

// رویداد اتصال کلاینت‌ها
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // ایجاد کلاینت جدید و اضافه کردن به مپ
  const newClient = new Client(socket);
  clients.set(socket.id, newClient);

  // دریافت پیام start از کلاینت
  socket.on("start", () => {
    console.log(`Start received from ${socket.id}`);
    
    // اگر یک کلاینت دیگر در انتظار است، اتصال را برقرار کنیم
    const waitingClient = [...clients.values()].find(client => client.waitingForPeer && client.id !== socket.id);

    if (waitingClient) {
      // ارسال آیدی یکدیگر برای اتصال
      socket.emit("connect_peer", waitingClient.id);
      waitingClient.socket.emit("connect_peer", socket.id);

      // تنظیم حالت برای هر دو کلاینت که آماده ارتباط پشتیبانی هستند
      newClient.peerId = waitingClient.id;
      waitingClient.peerId = socket.id;

      // کلاینت‌ها آماده ارتباط peer-to-peer هستند
      newClient.waitingForPeer = false;
      waitingClient.waitingForPeer = false;
    } else {
      // اگر هیچ کلاینت دیگری در انتظار نیست، منتظر بماند
      newClient.waitingForPeer = true;
      console.log(`Client ${socket.id} is waiting for another client to start`);
    }
  });

  // دریافت پیام finish از کلاینت
  socket.on("finish", (peerId) => {
    console.log(`Finish received from ${socket.id} to disconnect from ${peerId}`);

    // قطع ارتباط P2P
    const peerClient = clients.get(peerId);
    if (peerClient) {
      peerClient.socket.emit("peer_disconnected", socket.id);
    }

    // قطع ارتباط
    newClient.peerId = null;
    peerClient.peerId = null;

    socket.emit("disconnected", peerId);
  });

  // دریافت پیام از کلاینت که می‌خواهد به سرور پیام بفرستد
  socket.on("send_message_to_server", (message) => {
    console.log(`Message from ${socket.id} to server: ${message}`);
    // سرور پیام را می‌تواند پردازش کند یا به سایر کلاینت‌ها ارسال کند
    io.emit("broadcast_message", { from: socket.id, message });
  });

  // قطع اتصال کلاینت
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
    clients.delete(socket.id);
    // اگر کلاینتی در حال ارتباط peer-to-peer بوده باشد، باید قطع شود
    if (newClient.peerId) {
      const peerClient = clients.get(newClient.peerId);
      if (peerClient) {
        peerClient.socket.emit("peer_disconnected", socket.id);
      }
    }
  });
});

// کلاس Client که به‌طور مستقل برای هر کلاینت ایجاد می‌شود
class Client {
  constructor(socket) {
    this.id = socket.id;
    this.socket = socket;
    this.waitingForPeer = false; // آیا منتظر اتصال به کلاینت دیگری است؟
    this.peerId = null; // آیدی کلاینت متصل به آن
  }

  // ارسال پیام به این کلاینت
  sendMessage(message) {
    if (this.peerId) {
      const peerClient = clients.get(this.peerId);
      if (peerClient) {
        peerClient.socket.emit("receive_message", { from: this.id, message });
      }
    } else {
      console.log(`Peer not connected yet for client ${this.id}`);
    }
  }

  // دریافت پیام از سرور یا کلاینت دیگر
  receiveMessage(message) {
    console.log(`Client ${this.id} received message:`, message);
  }
}

// راه‌اندازی سرور
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
