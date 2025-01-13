const io = require("socket.io")(process.env.PORT, {
  cors: {
    origin: "*",
  },
});

const route = [
  "http://localhost:4001", // روتر دوم
  "http://localhost:4002", // روتر سوم
];

const socketPool = {}; // نگهداری سوکت‌ها برای هر مقصد

const getSocket = (destination) => {
  if (!socketPool[destination]) {
    socketPool[destination] = require("socket.io-client")(destination);
    console.log(`Created new socket connection to ${destination}`);
  }
  return socketPool[destination];
};

io.on("connection", (socket) => {
  console.log(`Router connected: ${socket.id}`);

  socket.on("route_message", (data, callback) => {
    console.log("Message received at router:", data);

    // بررسی مقصد بعدی
    const nextDestination = route.shift();

    if (nextDestination) {
      // دریافت یا ایجاد سوکت به مقصد بعدی
      const nextSocket = getSocket(nextDestination);

      nextSocket.emit(
        "route_message",
        data, // ارسال داده بدون رمزنگاری
        (response) => {
          // ارسال پاسخ به کلاینت اصلی
          callback(response);
        }
      );
    } else {
      // پیام به سرور نهایی ارسال می‌شود
      const finalServer = getSocket("http://localhost:5000");
      finalServer.emit("process_message", data.data, (response) => {
        console.log("Response from final server:", response);

        // ارسال پاسخ به کلاینت
        callback({ result: response });
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Router disconnected:", socket.id);
  });
});

console.log(`Router running on port ${process.env.PORT}`);
