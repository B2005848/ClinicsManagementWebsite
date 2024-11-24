const messageService = require("../Services/meesage.service");

const messageController = {
  //----------------------------------------------SEND MESSAGE--------------------------------
  async sendMessage(req, res) {
    const { senderId, senderType, receiverId, receiverType, content } =
      req.body;

    try {
      // Gửi tin nhắn qua service
      const result = await messageService.sendMessage(
        senderId,
        senderType,
        receiverId,
        receiverType,
        content
      );

      if (result.status === true) {
        // Phát sự kiện gửi tin nhắn qua socket
        const io = req.app.get("io"); // Truyền đối tượng io từ app vào controller
        io.emit("send_message", {
          senderId,
          senderType,
          receiverId,
          receiverType,
          content,
        });

        return res.status(200).json(result); // Success response
      } else {
        return res.status(400).json(result); // Error response
      }
    } catch (error) {
      console.error("Error in sendMessage controller:", error);
      return res
        .status(500)
        .json({ status: false, message: "Internal server error" });
    }
  },

  //----------------------------------------------GET MESSAGES--------------------------------
  async getMessages(req, res) {
    const { senderId, receiverId, page = 1 } = req.query;

    // Kiểm tra nếu thiếu thông tin cần thiết
    if (!senderId || !receiverId) {
      return res.status(400).json({
        status: false,
        message: `SenderId and ReceiverId are required. ${senderId}, ${receiverId}`,
        data: {
          senderId,
          receiverId,
        },
      });
    }

    try {
      // Thực hiện xử lý lấy tin nhắn
      const result = await messageService.getMessages(
        senderId,
        receiverId,
        page
      );
      return res.status(result.status ? 200 : 400).json(result);
    } catch (error) {
      console.error("Error in getMessages controller:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
      });
    }
  },
};

module.exports = messageController;
