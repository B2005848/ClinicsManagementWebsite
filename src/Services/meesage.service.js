const { knex } = require("../../db.config");

const messageService = {
  //----------------------------------------------SEND MESSAGE--------------------------------
  async sendMessage(senderId, senderType, receiverId, receiverType, content) {
    try {
      // Validate input data
      if (
        !senderId ||
        !senderType ||
        !receiverId ||
        !receiverType ||
        !content ||
        typeof content !== "string" ||
        content.trim() === ""
      ) {
        return {
          status: false,
          message:
            "Invalid input data. Sender, Receiver, and Content are required.",
        };
      }

      // Kiểm tra loại tài khoản hợp lệ
      const validTypes = ["staff", "patient"];
      if (
        !validTypes.includes(senderType) ||
        !validTypes.includes(receiverType)
      ) {
        return {
          status: false,
          message: "Invalid sender or receiver type.",
        };
      }

      // Kiểm tra sự tồn tại của sender và receiver
      const senderTable =
        senderType === "staff" ? "STAFF_ACCOUNTS" : "PATIENT_ACCOUNTS";
      const receiverTable =
        receiverType === "staff" ? "STAFF_ACCOUNTS" : "PATIENT_ACCOUNTS";

      const senderExists = await knex(senderTable)
        .where(senderType === "staff" ? "staff_id" : "patient_id", senderId)
        .first();

      const receiverExists = await knex(receiverTable)
        .where(receiverType === "staff" ? "staff_id" : "patient_id", receiverId)
        .first();

      if (!senderExists || !receiverExists) {
        return {
          status: false,
          message: "Sender or Receiver does not exist.",
        };
      }

      // Insert message into the database
      const result = await knex("MESSAGES")
        .insert({
          sender_id: senderId,
          sender_type: senderType,
          receiver_id: receiverId,
          receiver_type: receiverType,
          content,
          timestamp: knex.fn.now(),
          status: "sent",
        })
        .returning("message_id");

      if (result && result.length) {
        return {
          status: true,
          message: "Message sent successfully",
          messageId: result[0],
        };
      } else {
        return { status: false, message: "Failed to send message" };
      }
    } catch (error) {
      console.error("Error occurred while sending message:", error);
      return {
        status: false,
        message: "An error occurred while sending the message.",
      };
    }
  },

  //----------------------------------------------GET MESSAGES--------------------------------
  async getMessages(senderId, receiverId, page) {
    try {
      const itemsPerPage = 10;
      const offset = (page - 1) * itemsPerPage;

      // Validate input data
      if (!senderId || !receiverId || !page) {
        return {
          status: false,
          message:
            "Invalid input data. Sender, Receiver, and Page are required.",
        };
      }

      // Count total messages
      const totalMessages = await knex("MESSAGES")
        .count("* as totalCount")
        .where(function () {
          this.where("sender_id", senderId).andWhere("receiver_id", receiverId);
        })
        .orWhere(function () {
          this.where("sender_id", receiverId).andWhere("receiver_id", senderId);
        })
        .first();

      const totalItems = totalMessages.totalCount;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      if (page > totalPages) {
        return {
          status: false,
          message: `Page ${page} exceeds total number of pages (${totalPages}). No messages available.`,
          totalPages,
          listMessages: [],
        };
      }

      // Retrieve messages with pagination
      const messages = await knex("MESSAGES")
        .select("*")
        .where(function () {
          this.where("sender_id", senderId).andWhere("receiver_id", receiverId);
        })
        .orWhere(function () {
          this.where("sender_id", receiverId).andWhere("receiver_id", senderId);
        })
        .orderBy("timestamp", "asc")
        .limit(itemsPerPage)
        .offset(offset);

      if (messages.length > 0) {
        return {
          status: true,
          message: "Messages retrieved successfully",
          totalPages,
          itemsPerPage,
          listMessages: messages,
        };
      } else {
        return {
          status: false,
          message: "No messages found",
          totalPages,
          itemsPerPage,
          listMessages: [],
        };
      }
    } catch (error) {
      console.error("Error occurred while retrieving messages:", error);
      return {
        status: false,
        message: "An error occurred while retrieving messages.",
      };
    }
  },
};

module.exports = messageService;
