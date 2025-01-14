const WebSocket = require("ws");
const {
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
} = require("wrtc");
const readline = require("readline");

// ورودی کنسول
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// متغیرها برای مدیریت ارتباط‌ها
let peerConnection = null;
let dataChannel = null;
let peerId = null;

// اتصال به سرور سیگنال‌دهی
const ws = new WebSocket("ws://localhost:3000");

ws.on("open", () => {
  console.log("به سرور متصل شدیم");
  rl.question("آیدی کلاینت مقصد را وارد کنید: ", (targetId) => {
    peerId = targetId;
    createConnection(true);
  });
});

// دریافت سیگنال‌ها از دیگر کلاینت‌ها
ws.on("message", (message) => {
  const { from, data } = JSON.parse(message);
  if (from !== peerId) {
    console.log(`پیام سیگنال از ${from}:`, data);

    if (data.type === "offer") {
      handleOffer(data);
    } else if (data.type === "answer") {
      handleAnswer(data);
    } else if (data.type === "candidate") {
      handleCandidate(data);
    }
  }
});

// ایجاد ارتباط P2P با WebRTC
function createConnection(isInitiator) {
  peerConnection = new RTCPeerConnection();

  // ایجاد کانال داده
  dataChannel = peerConnection.createDataChannel("chat");

  dataChannel.onmessage = (event) => {
    console.log(`پیام دریافتی: ${event.data}`);
  };

  // تنظیم ICE Candidate
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendSignal("candidate", event.candidate);
    }
  };

  // زمانی که کانال داده باز شد
  dataChannel.onopen = () => {
    console.log("کانال داده باز شد.");
  };

  // زمانی که کانال داده بسته شد
  dataChannel.onclose = () => {
    console.log("کانال داده بسته شد.");
  };

  // شروع به ارسال پیشنهاد (offer) اگر initiator باشد
  if (isInitiator) {
    peerConnection
      .createOffer()
      .then((offer) => {
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        sendSignal("offer", peerConnection.localDescription);
      });
  }
}

// ارسال سیگنال به سرور
function sendSignal(type, data) {
  const message = JSON.stringify({
    from: "client1", // شناسه کلاینت خود را وارد کنید
    to: peerId,
    data: { type, ...data },
  });
  ws.send(message);
}

// هندل کردن offer از طرف کلاینت دیگر
function handleOffer(offer) {
  peerConnection
    .setRemoteDescription(new RTCSessionDescription(offer))
    .then(() => {
      return peerConnection.createAnswer();
    })
    .then((answer) => {
      return peerConnection.setLocalDescription(answer);
    })
    .then(() => {
      sendSignal("answer", peerConnection.localDescription);
    });
}

// هندل کردن answer از طرف کلاینت دیگر
function handleAnswer(answer) {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
}

// هندل کردن candidate از طرف کلاینت دیگر
function handleCandidate(candidate) {
  const iceCandidate = new RTCIceCandidate(candidate);
  peerConnection.addIceCandidate(iceCandidate);
}

// ارسال پیام از طریق کنسول
rl.on("line", (input) => {
  dataChannel.send(input);
  console.log(`شما: ${input}`);
});
