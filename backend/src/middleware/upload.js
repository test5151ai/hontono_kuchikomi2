const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

// スクリーンショット用のストレージ設定
const screenshotStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/approval_screenshots/');
  },
  filename: (req, file, cb) => {
    // UUIDを使用してファイル名を生成
    const uuid = uuidv4();
    cb(null, `${uuid}${path.extname(file.originalname)}`);
  }
});

// ファイルフィルター
const screenshotFileFilter = (req, file, cb) => {
  // 許可する画像形式
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('JPG、JPEG、またはPNG形式の画像のみアップロード可能です'), false);
  }
};

// スクリーンショットアップロード用のmulter設定
const uploadScreenshot = multer({
  storage: screenshotStorage,
  fileFilter: screenshotFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB（.envから取得）
  }
});

module.exports = {
  upload,
  uploadScreenshot
}; 