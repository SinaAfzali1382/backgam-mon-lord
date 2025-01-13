const io = require("socket.io-client");

const socket = io("http://localhost:3000");

let targetSocketId = null; // ذخیره آیدی همتا

socket.on("connect", () => {
  console.log(`Connected to server with ID: ${socket.id}`);

  // اعلام آمادگی به سرور
  socket.emit("start");

  // دریافت آیدی کلاینت دیگر
  socket.on("peer_connected", ({ targetSocketId: peerId }) => {
    console.log(`Connected to peer: ${peerId}`);
    targetSocketId = peerId;

    // ارسال پیام اولیه به همتا
    socket.emit("send_message", {
      to: targetSocketId,
      message: "Hello from client!",
    });
  });

  // دریافت پیام از کلاینت دیگر
  socket.on("receive_message", ({ from, message }) => {
    console.log(`Message from ${from}: ${message}`);
  });
});

// تابع برای ارسال پیام‌های بیشتر
function sendMessageToPeer(message) {
  if (!targetSocketId) {
    console.log("Peer not connected yet!");
    return;
  }

  socket.emit("send_message", {
    to: targetSocketId,
    message,
  });

  console.log(`Message sent to ${targetSocketId}: ${message}`);
}

// مثال: ارسال پیام جدید بعد از 5 ثانیه
setTimeout(() => {
  sendMessageToPeer("This is another message!");
}, 5000);
