const uploadService = require("../Services/upload.service");

// Controller để xử lý việc upload ảnh và lưu đường dẫn vào CSDL
const uploadController = {
  async uploadAvatarController(req, res, next) {
    try {
      // Gọi service để upload ảnh và lưu vào CSDL
      const result = await uploadService.uploadAvtStaffService(req, res);

      // Trả về phản hồi thành công
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result); // Nếu có lỗi, trả về với mã trạng thái 400
      }
    } catch (error) {
      // Truyền lỗi đến middleware xử lý lỗi hoặc trả về lỗi chi tiết
      next({
        status: error.status || 500,
        message: error.message || "Đã xảy ra lỗi trong quá trình upload ảnh",
        stack: error.stack,
      });
    }
  },

  async uploadAvatarPatientController(req, res, next) {
    try {
      // Gọi service để upload ảnh và lưu vào CSDL
      const result = await uploadService.uploadAvtPatientService(req, res);

      // Trả về phản hồi thành công
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result); // Nếu có lỗi, trả về với mã trạng thái 400
      }
    } catch (error) {
      // Truyền lỗi đến middleware xử lý lỗi hoặc trả về lỗi chi tiết
      next({
        status: error.status || 500,
        message: error.message || "Đã xảy ra lỗi trong quá trình upload ảnh",
        stack: error.stack,
      });
    }
  },
};

module.exports = uploadController;
