const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // یا آدرس کلاینت‌ها را مشخص کنید
    methods: ["GET", "POST"],
  },
});

app.use(express.static("public")); // برای سرو کردن فایل‌های استاتیک

io.on("connection", (socket) => {
  console.log("یک کلاینت متصل شد:", socket.id);

  // دریافت سیگنال از یک کلاینت و ارسال به کلاینت دیگر
  socket.on("signal", ({ to, data }) => {
    io.to(to).emit("signal", { from: socket.id, data });
  });

  // ارسال لیست کلاینت‌ها به همه
  socket.on("request-clients", () => {
    const clients = Array.from(io.sockets.sockets.keys());
    socket.emit("clients", clients);
  });

  socket.on("disconnect", () => {
    console.log("یک کلاینت قطع شد:", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
