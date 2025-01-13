const io = require("socket.io")(process.env.PORT, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`Router connected: ${socket.id}`);

  socket.on("route_message", (data, callback) => {
    console.log("Message received at router:", data);

    // بررسی مقصد بعدی
    const nextDestination = data.route.shift();

    if (nextDestination) {
      // ارسال به مقصد بعدی
      const nextSocket = require("socket.io-client")(nextDestination);
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
      const finalServer = require("socket.io-client")("http://localhost:5000");
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
