const app = require("./src/app");
const { checkconnection } = require("./db.config");
const http = require("http");
const socketIo = require("socket.io");

const PORT = process.env.PORT || 3000;

// Test database connection
checkconnection().then((connected) => {
  if (connected) {
    const server = http.createServer(app);
    const io = socketIo(server, {
      cors: {
        origin: "*", // Thay bằng URL frontend của bạn nếu cần thiết
        methods: ["GET", "POST"],
      },
    });

    app.set("io", io);

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

        // Tạo sự kiện "new_chat_pair" khi có một cặp chat mới
        if (data.receiverId && data.senderId) {
          const newChatPair = {
            first_name: data.senderFirstName,
            last_name: data.senderLastName,
            contact_id: data.senderId,
            last_message: data.message,
            timestamp: Date.now(),
            image_avt: data.senderAvatar, // Đảm bảo thông tin ảnh avatar nếu có
          };

          // Phát sự kiện "new_chat_pair" cho client
          io.to(data.receiverId).emit("new_chat_pair", newChatPair);
        }
      });

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
      });
    });

    server.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Server is running on all network interfaces at port ${PORT}.`
      );
    });
  } else {
    console.error("Connection to database failed");
  }
});
