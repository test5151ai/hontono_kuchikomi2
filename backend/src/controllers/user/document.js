const path = require('path');
const fs = require('fs');
const { User, VerificationDocument } = require('../../models');

/**
 * 書類ステータスを取得する
 * @param {Object} req リクエストオブジェクト 
 * @param {Object} res レスポンスオブジェクト
 */
exports.getDocumentStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // ユーザー情報を取得
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }

        // 書類一覧を取得
        const documents = await VerificationDocument.findAll({
            where: { userId },
            order: [['uploadedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: {
                documentStatus: user.documentStatus,
                documentSubmittedAt: user.documentSubmittedAt,
                documentVerifiedAt: user.documentVerifiedAt,
                documentRejectReason: user.documentRejectReason,
                hasDocuments: documents.length > 0,
                documents: documents
            }
        });
    } catch (error) {
        console.error('書類ステータス取得エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * 書類一覧を取得する
 * @param {Object} req リクエストオブジェクト
 * @param {Object} res レスポンスオブジェクト
 */
exports.getDocuments = async (req, res) => {
    try {
        const userId = req.user.id;

        // 書類一覧を取得
        const documents = await VerificationDocument.findAll({
            where: { userId },
            order: [['uploadedAt', 'DESC']]
        });

        res.json({
            success: true,
            data: documents
        });
    } catch (error) {
        console.error('書類一覧取得エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * 書類をアップロードする
 * @param {Object} req リクエストオブジェクト 
 * @param {Object} res レスポンスオブジェクト
 */
exports.uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'ファイルが選択されていません'
            });
        }

        const userId = req.user.id;
        
        // ファイルパスをpublicディレクトリからの相対パスに変換
        const publicPath = path.resolve(__dirname, '../../../public');
        let relativePath = req.file.path.replace(publicPath, '');
        
        // Windowsパスの場合、バックスラッシュをスラッシュに変換
        relativePath = relativePath.replace(/\\/g, '/');
        
        console.log('アップロードされたファイル情報:', {
            originalPath: req.file.path,
            publicPath: publicPath,
            relativePath: relativePath
        });

        const documentName = req.body.documentName || '確認書類';
        const documentType = req.body.documentType || 'other';

        // ユーザー情報を取得
        const user = await User.findByPk(userId);
        if (!user) {
            // ファイルを削除
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(404).json({
                success: false,
                message: 'ユーザーが見つかりません'
            });
        }

        // 書類レコードを作成
        const document = await VerificationDocument.create({
            userId,
            documentPath: relativePath,
            documentName,
            documentType,
            uploadedAt: new Date()
        });

        // 初回アップロードの場合はステータスを変更
        if (user.documentStatus === 'not_submitted') {
            await user.update({
                documentStatus: 'submitted',
                documentSubmittedAt: new Date()
            });
        }

        res.json({
            success: true,
            message: '書類がアップロードされました',
            data: document
        });
    } catch (error) {
        console.error('書類アップロードエラー:', error);
        
        // エラー時にアップロードされたファイルを削除
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * 特定の書類を削除する
 * @param {Object} req リクエストオブジェクト 
 * @param {Object} res レスポンスオブジェクト
 */
exports.deleteDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.documentId;

        // 書類が存在するか確認
        const document = await VerificationDocument.findOne({
            where: { id: documentId, userId }
        });

        if (!document) {
            return res.status(404).json({
                success: false,
                message: '指定された書類が見つかりません'
            });
        }

        // ファイルパスを取得
        let filePath = document.documentPath;
        
        // 相対パスの場合はフルパスに変換
        if (filePath && !path.isAbsolute(filePath)) {
            filePath = path.join(__dirname, '../../../public', filePath);
        }
        
        console.log('削除対象ファイル:', {
            originalPath: document.documentPath,
            resolvedPath: filePath
        });
        
        // ファイルが存在する場合は削除
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // データベースから削除
        await document.destroy();

        // 残りの書類を確認
        const remainingDocs = await VerificationDocument.count({ where: { userId } });
        if (remainingDocs === 0) {
            // 書類がなくなった場合はステータスを更新
            await User.update(
                { documentStatus: 'not_submitted', documentSubmittedAt: null },
                { where: { id: userId } }
            );
        }

        res.json({
            success: true,
            message: '書類が削除されました'
        });
    } catch (error) {
        console.error('書類削除エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
};

/**
 * 全ての書類を削除する（レガシー互換用）
 * @param {Object} req リクエストオブジェクト 
 * @param {Object} res レスポンスオブジェクト
 */
exports.deleteAllDocuments = async (req, res) => {
    try {
        const userId = req.user.id;

        // ユーザーの全ての書類を取得
        const documents = await VerificationDocument.findAll({
            where: { userId }
        });

        // 各書類のファイルを削除
        for (const doc of documents) {
            // ファイルパスを取得
            let filePath = doc.documentPath;
            
            // 相対パスの場合はフルパスに変換
            if (filePath && !path.isAbsolute(filePath)) {
                filePath = path.join(__dirname, '../../../public', filePath);
            }
            
            // ファイルが存在する場合は削除
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // データベースから一括削除
        await VerificationDocument.destroy({
            where: { userId }
        });

        // ユーザーステータスを更新
        await User.update(
            { documentStatus: 'not_submitted', documentSubmittedAt: null },
            { where: { id: userId } }
        );

        res.json({
            success: true,
            message: '全ての書類が削除されました'
        });
    } catch (error) {
        console.error('書類一括削除エラー:', error);
        res.status(500).json({
            success: false,
            message: 'サーバーエラーが発生しました'
        });
    }
}; 