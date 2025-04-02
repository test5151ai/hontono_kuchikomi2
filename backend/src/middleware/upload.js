const multer = require('multer');
const path = require('path');

// ストレージの設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // ファイル名をユニークにする
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ファイルフィルター
const fileFilter = (req, file, cb) => {
  // 画像ファイルのみ許可
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('画像ファイルのみアップロード可能です'), false);
  }
};

// multerの設定
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload; 