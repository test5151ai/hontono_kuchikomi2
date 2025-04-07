# 開発ガイド

## 1. 開発環境構築

### 1.1 前提条件
- Node.js v20.12.0 以上
- PostgreSQL v17.4 以上
- Git

### 1.2 ローカル環境構築手順

1. **リポジトリのクローン**:
   ```bash
   git clone https://github.com/test5151ai/hontono_kuchikomi2.git
   cd hontono_kuchikomi2
   ```

2. **バックエンドの設定**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # .envファイルを編集してDBの接続情報などを設定
   ```

3. **フロントエンドの設定**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **データベースの設定**:
   ```bash
   # PostgreSQLでデータベースを作成
   createdb hontono_kuchikomi

   # マイグレーションの実行
   cd ../backend
   npx sequelize-cli db:migrate --migrations-path=./src/database/migrations
   ```

5. **開発用サーバーの起動**:
   ```bash
   # バックエンドサーバー
   cd backend
   npm run dev

   # フロントエンドサーバー(別のターミナルで)
   cd frontend
   npm run dev
   ```

## 2. プロジェクト構成

### 2.1 ディレクトリ構造
```
hontono_kuchikomi2/
├── backend/              # バックエンドアプリケーション
│   ├── src/              # ソースコード
│   │   ├── app.js        # アプリケーションエントリーポイント
│   │   ├── config/       # 設定ファイル
│   │   ├── controllers/  # コントローラー
│   │   ├── database/     # データベース設定・マイグレーション
│   │   ├── middlewares/  # ミドルウェア
│   │   ├── models/       # Sequelizeモデル
│   │   ├── routes/       # ルーティング
│   │   ├── services/     # ビジネスロジック
│   │   └── utils/        # ユーティリティ関数
│   ├── uploads/          # アップロードファイル保存ディレクトリ
│   ├── package.json      # 依存関係
│   └── .env.example      # 環境変数テンプレート
│
├── frontend/             # フロントエンドアプリケーション
│   ├── public/           # 静的ファイル
│   │   ├── css/          # スタイルシート
│   │   ├── js/           # JavaScriptファイル
│   │   ├── images/       # 画像ファイル
│   │   ├── index.html    # メインHTMLファイル
│   │   └── *.html        # その他のHTMLファイル
│   ├── src/              # ソースコード
│   └── package.json      # 依存関係
│
├── docs/                 # プロジェクトドキュメント
│   ├── API_SPECS.md      # API仕様書
│   ├── FUNCTIONAL_SPECS.md # 機能仕様書
│   ├── TECHNICAL_SPECS.md # 技術仕様書
│   └── DEVELOPMENT_GUIDE.md # 開発ガイド
│
└── README.md             # プロジェクト概要
```

### 2.2 テクノロジースタック
- **バックエンド**: Node.js, Express, Sequelize
- **フロントエンド**: Vanilla JavaScript, HTML5, CSS3, Bootstrap 5
- **データベース**: PostgreSQL
- **認証**: JWT
- **リアルタイム通信**: Socket.io

## 3. 開発ワークフロー

### 3.1 Git ワークフロー
1. 最新の変更を取得する: `git pull origin main`
2. 機能開発用ブランチを作成: `git checkout -b feature/機能名`
3. 変更を実装しコミット: `git commit -m "変更内容を説明するメッセージ"`
4. メインブランチにマージ: `git checkout main && git merge feature/機能名`
5. リモートにプッシュ: `git push origin main`

### 3.2 コーディング規約

#### JavaScript
- ES2015+の機能を積極的に活用する
- 変数名・関数名はキャメルケース（例: `getUserData`）
- クラス名はパスカルケース（例: `UserController`）
- 定数は大文字スネークケース（例: `MAX_FILE_SIZE`）
- 適切なコメントを追加する
- ESLintの設定に従ってコードを整形する

#### HTML/CSS
- セマンティックなHTMLタグを使用する
- CSSクラス名はBEMメソドロジーに従う
- レスポンシブデザインを意識する
- アクセシビリティに配慮する

### 3.3 コミットメッセージ規約
- 簡潔で明確なメッセージを書く
- 日本語で記述する場合は体言止め
- 変更内容によって接頭辞を付ける
  - `[新機能]` - 新機能追加
  - `[修正]` - バグ修正
  - `[改善]` - 機能改善
  - `[リファクタ]` - コードリファクタリング
  - `[ドキュメント]` - ドキュメント関連の変更

## 4. 開発・テストルール

### 4.1 UI開発時の手順
1. AdminLTEのドキュメントを参照
2. 共通コンポーネントの使用を検討
3. レスポンシブ対応を確認
4. デザインの一貫性を維持
5. 既存のUIコンポーネントを再利用
6. アクセシビリティに配慮

### 4.2 コード編集時の手順
1. 編集対象ファイルの内容を確認
2. 関連するファイルの依存関係を確認
3. 変更内容を明確に説明
4. エラーハンドリングを考慮
5. テストの必要性を検討

### 4.3 API開発の手順
1. API仕様書を確認・更新
2. コントローラーの実装
3. 入力バリデーションの実装
4. エラーハンドリングの実装
5. マニュアルテストの実施

### 4.4 テスト手順
1. ローカル環境での動作確認
2. エッジケースの確認
3. クロスブラウザテスト（Chrome, Firefox, Safari, Edge）
4. モバイル表示の確認
5. コードレビュー

## 5. タスク管理とリリース

### 5.1 タスク管理のルール
- GitHubのIssuesでタスクを管理
- 各タスクには担当者とデッドラインを設定
- タスクの進捗状況を定期的に更新
- 完了したタスクにはクローズコメントを記載

### 5.2 リリースフロー
1. 開発環境でのテスト完了
2. ステージング環境へのデプロイと検証
3. 本番環境へのデプロイ
4. リリース後の監視とフィードバック収集
5. 必要に応じたホットフィックス

## 6. トラブルシューティング

### 6.1 よくある問題と解決策
- **マイグレーションエラー**: 
  - 既存のテーブル名と大文字小文字が一致しているか確認
  - リレーションシップの定義が正しいか確認
- **認証エラー**:
  - JWTトークンが正しく設定されているか確認
  - トークンの有効期限が切れていないか確認
- **CORSエラー**:
  - `config.js`でAPIのURLが正しく設定されているか確認
  - バックエンドのCORS設定が正しいか確認
- **スクリプトエラー**:
  - HTMLファイル内のスクリプト読み込み順序が正しいか確認
  - `config.js`が他のスクリプトより先に読み込まれているか確認

### 6.2 デバッグ方法
- **バックエンド**: 
  - ログ出力で問題箇所を特定
  - デバッガーを使用したステップ実行
- **フロントエンド**:
  - ブラウザの開発者ツールでコンソールログを確認
  - ネットワークタブでAPIリクエストを確認
  - 要素インスペクタでDOM構造を確認

## 7. リソースとリファレンス

- [Express.js ドキュメント](https://expressjs.com/)
- [Sequelize ドキュメント](https://sequelize.org/)
- [Bootstrap ドキュメント](https://getbootstrap.com/docs/5.3/)
- [AdminLTE ドキュメント](https://adminlte.io/docs/3.2/)
- [Socket.io ドキュメント](https://socket.io/docs/) 