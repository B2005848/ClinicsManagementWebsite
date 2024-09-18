const uploadService = require("../Services/upload.service");

// Controller để xử lý việc upload ảnh và lưu đường dẫn vào CSDL
const uploadController = {
  async uploadAvatarController(req, res, next) {
    try {
      // Gọi service để upload ảnh và lưu vào CSDL
      const result = await uploadService.uploadAvtStaffService(req, res);

      // Trả về phản hồi thành công
      res.json(result);
    } catch (error) {
      // Trả về phản hồi lỗi
      res.status(500).json(error);
    }
  },
};

module.exports = uploadController;
