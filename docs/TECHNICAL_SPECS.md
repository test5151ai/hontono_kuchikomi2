# 技術仕様書

## 1. 全体アーキテクチャ
- クライアント-サーバーモデル
- RESTful API + WebSocketによるリアルタイム通信
- PostgreSQLによるデータ永続化
- マイクロサービスアーキテクチャの採用（将来的な拡張性を考慮）

## 2. 技術スタック

### 2.1 フロントエンド
- **基本技術**: 
  - HTML5
  - CSS3 (Bootstrap v5.3.3)
  - Vanilla JavaScript (ES2025)
  - AdminLTE v3.2.0 (管理画面UI)
- **通信方式**: 
  - Fetch API (RESTful API通信)
  - WebSocket (リアルタイム通信)
- **主要ライブラリ**:
  - Socket.io-client v4.7.4
  - Bootstrap v5.3.3 (モバイルファースト対応)
  - date-fns v3.3.1
  - DOMPurify v3.0.9 (XSS対策)
  - Chart.js v4.4.2 (統計情報の可視化)

### 2.2 バックエンド
- **サーバー環境**: Node.js v20.12.0 LTS
- **Webフレームワーク**: Express.js v4.18.3
- **データベース**: PostgreSQL v17.4
- **リアルタイム通信**: Socket.io v4.7.4
- **主要パッケージ**:
  - express: v4.18.3
  - pg: v8.11.3
  - sequelize: v6.37.1
  - socket.io: v4.7.4
  - nodemailer: v6.9.12 (メール送信)
  - jsonwebtoken: v9.0.2
  - bcrypt: v5.1.1
  - cors: v2.8.5
  - dotenv: v16.4.5
  - helmet: v7.1.0 (セキュリティヘッダー)
  - rate-limiter-flexible: v2.4.1 (レート制限)
  - winston: v3.11.0 (ロギング)
  - joi: v17.12.2 (バリデーション)

## 3. データモデル

### 3.1 ユーザーモデル
```javascript
{
  id: UUID,
  username: String,
  email: String,
  password: String (hashed),
  role: String, // 'user', 'admin', 'superuser'
  isApproved: Boolean, // 承認状態
  isSuperAdmin: Boolean, // スーパーユーザー権限
  submissionMethod: String, // 'email' または 'line'
  submissionContact: String, // メールアドレスまたはLINE ID
  approvedAt: Date, // 承認日時
  approvedBy: UUID, // 承認した管理者のID
  createdAt: Date,
  updatedAt: Date
}
```

### 3.2 カテゴリモデル
```javascript
{
  id: UUID,
  name: String,
  description: String,
  slug: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.3 スレッドモデル
```javascript
{
  id: UUID,
  title: String,
  categoryId: UUID,
  authorId: UUID,
  createdAt: Date,
  updatedAt: Date
}
```

### 3.4 投稿モデル
```javascript
{
  id: UUID,
  threadId: UUID,
  authorId: UUID,
  content: String,
  helpfulCount: Number, // 参考になった数
  helpfulBy: [UUID], // 参考になったを押したユーザー
  createdAt: Date,
  updatedAt: Date
}
```

### 3.5 検証ドキュメントモデル
```javascript
{
  id: UUID,
  userId: UUID,
  originalFilename: String,
  storedFilename: String,
  fileType: String,
  fileSize: Number,
  status: String, // 'pending', 'approved', 'rejected'
  reviewedAt: Date,
  reviewedBy: UUID,
  createdAt: Date,
  updatedAt: Date
}
```

## 4. セキュリティ要件
- HTTPS通信の必須化
- JWTによる認証（アクセストークン + リフレッシュトークン）
- パスワードのハッシュ化（bcrypt）
- XSS対策（DOMPurify）
- CSRF対策
- レート制限の実装
- セキュリティヘッダーの適切な設定
- 入力値の厳密なバリデーション
- ファイルアップロードの制限と検証
- ログイン試行回数の制限

## 5. パフォーマンス要件
- ページロード時間: 2秒以内
- APIレスポンス時間: 200ms以内
- WebSocket接続の安定性確保
- 画像の最適化（WebP形式の使用）
- キャッシュ戦略の実装
- データベースインデックスの最適化
- コネクションプールの適切な設定

## 6. エラーハンドリング
- グローバルエラーハンドリングの実装
- カスタムエラークラスの定義
- エラーログの適切な記録
- ユーザーフレンドリーなエラーメッセージ
- エラー通知システムの実装

## 7. ファイルアップロード設定
- アップロードディレクトリ: `uploads/approval_screenshots`
- 最大ファイルサイズ: 5MB
- 許可される形式: jpg, jpeg, png
- ファイル名: UUID + 元の拡張子 