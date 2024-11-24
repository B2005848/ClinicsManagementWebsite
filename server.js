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
const PORT = process.env.PORT;

// Test database connection
checkconnection().then((connected) => {
  if (connected) {
    // Tạo HTTP server từ app Express
    const server = http.createServer(app);

    // Tích hợp Socket.IO với server HTTP
    const io = socketIo(server, {
      cors: {
        origin: "*", // Bạn có thể thay bằng URL frontend của bạn nếu cần thiết
        methods: ["GET", "POST"],
      },
    });

    // Truyền đối tượng io vào controller messageController
    app.set("io", io);

    // Lắng nghe kết nối socket
    io.on("connection", (socket) => {
      console.log("A user connected:", socket.id);
      // Các sự kiện socket khác có thể thêm ở đây
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
