const multer = require("multer");
const { knex } = require("../../db.config");
require("dotenv").config();

// Cấu hình multer để lưu ảnh vào thư mục 'Uploads' với tên gốc của file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Uploads/"); // Thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const uniqueSuffix = Date.now(); // Thêm timestamp để đảm bảo tên file không trùng
    cb(null, `${uniqueSuffix}-${originalName}`); // Đặt tên file với timestamp
  },
});

// Cấu hình multer upload
const upload = multer({ storage: storage });

const uploadService = {
  async uploadAvtStaffService(req, res) {
    return new Promise((resolve, reject) => {
      // Sử dụng multer để upload file
      upload.single("avatar")(req, res, async (err) => {
        if (err) {
          console.log("Multer error:", err);
          return reject({ success: false, message: "Lỗi khi upload ảnh" });
        }

        try {
          const staffId = req.body.staffId;
          const filePath = `/Uploads/${req.file.filename}`; // Đường dẫn lưu ảnh

          // Lưu đường dẫn ảnh vào SQL Server
          await knex("STAFF_DETAILS")
            .where("staff_id", staffId)
            .update({ image_avt: filePath });

          // Trả về kết quả thành công
          resolve({
            success: true,
            message: "Upload ảnh thành công và lưu vào CSDL",
            filePath: filePath,
          });
        } catch (error) {
          // Xử lý lỗi nếu có lỗi xảy ra trong quá trình lưu vào CSDL
          reject({
            success: false,
            message: "Lỗi khi lưu đường dẫn ảnh vào CSDL",
            error: error.message,
          });
        }
      });
    });
  },
};

module.exports = uploadService;
