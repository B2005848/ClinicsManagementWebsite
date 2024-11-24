const { knex } = require("../../db.config");

const messageService = {
  //----------------------------------------------SEND MESSAGE--------------------------------
  async sendMessage(
    io,
    senderId,
    senderType,
    receiverId,
    receiverType,
    content
  ) {
    try {
      // Validate input data (như cũ)

      // Insert message vào cơ sở dữ liệu
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
        .returning("*");

      if (result && result.length > 0) {
        const newMessage = result[0];

        // Phát tin nhắn tới Room của người nhận
        io.to(receiverId).emit("receive_message", newMessage);

        // Kiểm tra nếu đây là lần đầu có đoạn chat giữa sender và receiver
        const existingPair = await knex("MESSAGES")
          .where(function () {
            this.where("sender_id", senderId).andWhere(
              "receiver_id",
              receiverId
            );
          })
          .orWhere(function () {
            this.where("sender_id", receiverId).andWhere(
              "receiver_id",
              senderId
            );
          })
          .count("* as count")
          .first();

        if (existingPair.count === 1) {
          // Phát sự kiện đoạn chat mới đến người gửi
          io.to(senderId).emit("new_chat_pair", {
            contact_id: receiverId,
            last_message: content,
            timestamp: newMessage.timestamp,
          });

          // Phát sự kiện đoạn chat mới đến người nhận (nếu cần)
          io.to(receiverId).emit("new_chat_pair", {
            contact_id: senderId,
            last_message: content,
            timestamp: newMessage.timestamp,
          });
        }

        return {
          status: true,
          message: "Message sent successfully.",
          message: newMessage,
        };
      } else {
        return { status: false, message: "Failed to send message." };
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

  //----------------------------------------------GET CHAT PAIRS--------------------------------
  async getChatPairsBySenderId(senderId) {
    try {
      if (!senderId) {
        return {
          status: false,
          message: "SenderId is required.",
        };
      }

      // Lấy danh sách các cặp hội thoại duy nhất
      // const chatPairs = await knex("MESSAGES")
      //   .select(
      //     knex.raw(
      //       ` DISTINCT
      //     CASE
      //       WHEN sender_id = ? THEN receiver_id
      //       ELSE sender_id
      //     END AS contact_id
      //   `,
      //       [senderId]
      //     )
      //   )
      //   .where("sender_id", senderId)
      //   .orWhere("receiver_id", senderId);

      const chatPairs = await knex.raw(
        `
  WITH ChatContacts AS (
    SELECT 
      CASE 
        WHEN sender_id = ? THEN receiver_id
        ELSE sender_id
      END AS contact_id,
      timestamp
    FROM MESSAGES
    WHERE sender_id = ? OR receiver_id = ?
  )
  SELECT contact_id, MAX(timestamp) AS last_message_time
  FROM ChatContacts
  GROUP BY contact_id
  ORDER BY last_message_time DESC;
  `,
        [senderId, senderId, senderId]
      );

      if (chatPairs.length > 0) {
        return {
          status: true,
          message: "Chat pairs retrieved successfully",
          data: chatPairs,
        };
      } else {
        return {
          status: false,
          message: "No chat pairs found for this senderId.",
          data: [],
        };
      }
    } catch (error) {
      console.error("Error occurred while retrieving chat pairs:", error);
      return {
        status: false,
        message: "An error occurred while retrieving chat pairs.",
      };
    }
  },
};

module.exports = messageService;
