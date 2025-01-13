const io = require("socket.io-client");

// اتصال به روتر اول
const firstRouter = io("http://localhost:4000");

// پیام اولیه
const initialMessage = {
  data: 12345,
  route: [
    "http://localhost:4001", // روتر دوم
    "http://localhost:4002", // روتر سوم
  ],
};

firstRouter.emit(
  "route_message",
  initialMessage, // ارسال داده بدون رمزنگاری
  (response) => {
    console.log("Final response received by client:", response);
  }
);
