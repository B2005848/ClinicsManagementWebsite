const messageService = require("../Services/meesage.service");

const messageController = {
  //----------------------------------------------SEND MESSAGE--------------------------------
  async sendMessage(req, res) {
    try {
      const { senderId, senderType, receiverId, receiverType, content } =
        req.body;

      // Lấy đối tượng io từ app
      const io = req.app.get("io");

      // Gọi service để gửi tin nhắn
      const result = await messageService.sendMessage(
        io,
        senderId,
        senderType,
        receiverId,
        receiverType,
        content
      );

      if (result.status) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in sendMessage controller:", error);
      return res.status(500).json({ status: false, message: "Server error." });
    }
  },

  //----------------------------------------------GET MESSAGES--------------------------------
  async getMessages(req, res) {
    try {
      const { senderId, receiverId, page } = req.query;

      const result = await messageService.getMessages(
        senderId,
        receiverId,
        page
      );

      if (result.status) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getMessages controller:", error);
      return res.status(500).json({ status: false, message: "Server error." });
    }
  },

  async getChatPairs(req, res) {
    try {
      const { senderId } = req.query;

      const result = await messageService.getChatPairsBySenderId(senderId);

      if (result.status) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getChatPairs controller:", error);
      return res.status(500).json({ status: false, message: "Server error." });
    }
  },
};

module.exports = messageController;
