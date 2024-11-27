const multer = require("multer");
const { knex } = require("../../db.config");
require("dotenv").config();
const path = require("path");

// Kiểm tra file upload có hợp lệ không
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Chỉ cho phép các định dạng ảnh (.jpeg, .jpg, .png, .gif)!"));
  }
};

// ===================================================SETTING====================================================FOR STAFF
// Cấu hình multer để lưu ảnh vào thư mục 'Uploads' với tên gốc của file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "avtStaffs")); // Thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const uniqueSuffix = Date.now(); // Thêm timestamp để đảm bảo tên file không trùng
    cb(null, `${uniqueSuffix}-${originalName}`); // Đặt tên file với timestamp
  },
});

// Cấu hình multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter, // Sử dụng fileFilter để kiểm tra file upload
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file là 5MB
}).single("avatar");

// ==============================================SETTING=========================== FOR PATIENT
const storagePatient = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads", "avtPatients")); // Thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const uniqueSuffix = Date.now(); // Thêm timestamp để đảm bảo tên file không trùng
    cb(null, `${uniqueSuffix}-${originalName}`); // Đặt tên file với timestamp
  },
});

// Cấu hình multer upload
const uploadPatient = multer({
  storage: storagePatient,
  fileFilter: fileFilter, // Sử dụng fileFilter để kiểm tra file upload
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước file là 5MB
}).single("avatarPatient");

const uploadService = {
  async uploadAvtStaffService(req, res) {
    return new Promise((resolve, reject) => {
      upload(req, res, async (err) => {
        if (err) {
          console.log("Multer error:", err.message);
          return reject({
            success: false,
            message: "Lỗi khi upload ảnh",
            error: err.message,
          });
        }

        if (!req.file) {
          return reject({
            success: false,
            message: "Không có file ảnh được tải lên",
          });
        }

        try {
          const staffId = req.body.staffId;
          if (!staffId) {
            return reject({
              success: false,
              message: "Thiếu thông tin staffId",
            });
          }

          const filePath = `/uploads/avtStaffs/${req.file.filename}`; // Đường dẫn lưu ảnh

          // Lưu đường dẫn ảnh vào SQL Server
          await knex("STAFF_DETAILS")
            .where("staff_id", staffId)
            .update({ image_avt: filePath });

          // Trả về kết quả thành công
          resolve({
            success: true,
            message: "Upload ảnh nhân thành công và lưu vào CSDL",
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

  // ==============================================SETTING=========================== FOR PATIENT
  async uploadAvtPatientService(req, res) {
    return new Promise((resolve, reject) => {
      uploadPatient(req, res, async (err) => {
        if (err) {
          console.log("Multer error:", err.message);
          return reject({
            success: false,
            message: "Lỗi khi upload ảnh",
            error: err.message,
          });
        }

        if (!req.file) {
          return reject({
            success: false,
            message: "Không có file ảnh được tải lên",
          });
        }

        try {
          const patient_id = req.body.patientId;
          if (!patient_id) {
            return reject({
              success: false,
              message: "Thiếu thông tin patientId",
            });
          }

          const filePath = `/uploads/avtPatients/${req.file.filename}`; // Đường dẫn lưu ảnh

          // Lưu đường dẫn ảnh vào SQL Server
          await knex("PATIENT_DETAILS")
            .where("patient_id", patient_id)
            .update({ image_avt: filePath });

          // Trả về kết quả thành công
          resolve({
            success: true,
            message: "Upload ảnh bệnh nhân thành công và lưu vào CSDL",
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
