const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// 保存先ディレクトリの設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../public/uploads/documents');
    
    // ディレクトリがなければ作成
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // オリジナルファイル名を保持しつつ、一意のファイル名を生成
    const userId = req.user.id;
    const uniqueId = uuidv4();
    const fileExt = path.extname(file.originalname);
    const fileName = `${userId}_${uniqueId}${fileExt}`;
    
    cb(null, fileName);
  }
});

// ファイルフィルター（画像ファイルのみを許可）
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|pdf/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('許可されたファイル形式は .jpeg, .jpg, .png, .gif, .pdf のみです'), false);
  }
};

// アップロード設定
const uploadDocument = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter
}).single('document');

// エラーハンドリングを含むミドルウェア
const documentUpload = (req, res, next) => {
  uploadDocument(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        // Multerのエラー
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'ファイルサイズは5MB以下にしてください'
          });
        }
        return res.status(400).json({
          success: false,
          message: `アップロードエラー: ${err.message}`
        });
      }
      
      // その他のエラー
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // エラーがなければ次のミドルウェアへ
    next();
  });
};

module.exports = documentUpload; 