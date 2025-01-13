const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(5000, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Final server connected:", socket.id);

  socket.on("process_message", (data, callback) => {
    console.log("Message received at final server:", data);

    // پردازش پیام (مثلاً دو برابر کردن عدد)
    const result = data;

    console.log("Processed result:", result);

    // ارسال پاسخ
    callback(result);
  });

  socket.on("disconnect", () => {
    console.log("Final server disconnected:", socket.id);
  });
});

server.listen(9000, () => {
  console.log("Server is running on port 9000");
});
