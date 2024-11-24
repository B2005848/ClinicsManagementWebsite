// require("dotenv").config();
// const app = require("./src/app");
// const { checkconnection } = require("./db.config");

// // Start server
// const PORT = process.env.PORT;

// //test connect
// checkconnection().then((connected) => {
//   if (connected) {
//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(
//         `Server is running on all network interfaces at port ${PORT}.`
//       );
//     });
//   } else {
//     console.error("Connection to database failed");
//   }
// });
const app = require("./src/app");
const { checkconnection } = require("./db.config");
const http = require("http");
const socketIo = require("socket.io");

// Start server
const PORT = process.env.PORT || 3000;

// Test database connection
checkconnection().then((connected) => {
  if (connected) {
    // Tạo HTTP server từ app Express
    const server = http.createServer(app);

    // Tích hợp Socket.IO với server HTTP
    const io = socketIo(server, {
      cors: {
        origin: "*", // Thay bằng URL frontend của bạn nếu cần thiết
        methods: ["GET", "POST"],
      },
    });

    // Truyền đối tượng io vào app
    app.set("io", io);

    // Lắng nghe sự kiện từ client
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);

      // Người dùng tham gia room
      socket.on("join", ({ userId, role }) => {
        socket.join(userId);
        console.log(`${role} joined room: ${userId}`);
      });

      // Lắng nghe sự kiện gửi tin nhắn
      socket.on("send_message", (data) => {
        console.log("Message received:", data);

        // Phát tin nhắn tới Room của người nhận
        io.to(data.receiverId).emit("receive_message", data);
      });

      // Ngắt kết nối
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    // Khởi động server và lắng nghe ở cổng `PORT`
    server.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Server is running on all network interfaces at port ${PORT}.`
      );
    });
  } else {
    console.error("Connection to database failed");
  }
});
