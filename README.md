# 15ch - リアルタイム掲示板システム

![バージョン](https://img.shields.io/badge/version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13.x-blue)

## 📋 目次

- [概要](#概要)
- [システム構成](#システム構成)
- [開発ワークフロー](#開発ワークフロー)
- [デプロイ手順](#デプロイ手順)
- [管理・運用ガイド](#管理運用ガイド)
- [プロジェクト詳細](#プロジェクト詳細)
- [トラブルシューティング](#トラブルシューティング)
- [関連ドキュメント](#関連ドキュメント)
- [拡張計画](#拡張計画)
- [ライセンス](#ライセンス)

## 📝 概要

15chは承認制のリアルタイム掲示板システムです。主な特徴は以下の通りです：

- **ユーザー承認制**: スクリーンショット提出による本人確認後に投稿可能
- **カテゴリ分類**: 複数カテゴリによる整理された掲示板構造
- **リアルタイム更新**: 最新の投稿がリアルタイムで反映
- **モデレーション機能**: 管理者による投稿監視と制御
- **店舗情報表示**: スレッド単位での店舗情報の表示と管理

## 🖥️ システム構成

### インフラストラクチャ

- **本番環境**: VPS（さくらのVPS）
- **ドメイン**: [https://15ch.net](https://15ch.net)
- **Webサーバー**: Nginx
- **アプリケーションサーバー**: Node.js + PM2
- **データベース**: PostgreSQL 13
- **SSL**: Let's Encrypt

### アーキテクチャ

```
                   +---------------+
                   |     Nginx     |
                   |  リバースプロキシ  |
                   +-------+-------+
                           |
           +---------------+---------------+
           |                               |
  +--------v--------+           +---------v--------+
  |   Frontend      |           |    Backend       |
  |   (React)       |           |   (Express.js)   |
  |   Port: 8080    |           |   Port: 3000     |
  +--------+--------+           +---------+--------+
           |                               |
           |                               |
           |                    +----------v--------+
           |                    |   PostgreSQL      |
           |                    |   Database        |
           |                    +-------------------+
           |
+----------v-----------+
| Static Files (Public) |
+----------------------+
```

## 🔄 開発ワークフロー

### ブランチ戦略

- **`main`**: 本番環境用ブランチ。本番環境にデプロイされるコードが集約される
- **`server-state`**: サーバーサイド開発用ブランチ。バックエンド関連の変更
- **`feature/*`**: 新機能開発用の作業ブランチ

### CI/CD パイプライン (GitHub Actions)

GitHub Actionsにより、以下の自動化が実現されています：

1. **自動テスト**: バックエンドとフロントエンドのテスト自動実行
2. **コードチェック**: コード品質の検証
3. **ビルド確認**: 本番環境へのデプロイ前の最終確認

### 開発フロー

1. **機能ブランチの作成**:
   ```bash
   git checkout -b feature/新機能名
   ```

2. **開発・テスト**:
   ```bash
   # コードの変更
   # テストの実行
   npm test
   ```

3. **変更のコミットとプッシュ**:
   ```bash
   git add .
   git commit -m "機能の説明"
   git push origin feature/新機能名
   ```

4. **CI/CD確認とプルリクエスト作成**:
   - GitHubの「Actions」タブでワークフロー実行状況を確認
   - テスト成功後、プルリクエストを作成
   - コードレビュー依頼

5. **本番環境反映**:
   - `main`ブランチへのマージはプルリクエストを通じて行う
   - マージ後、サーバーで反映コマンドを実行

## 🚀 デプロイ手順

### 初回デプロイ

1. **リポジトリのクローン**:
   ```bash
   cd /var/www
   git clone https://github.com/test5151ai/hontono_kuchikomi2.git 15ch
   cd 15ch
   ```

2. **依存関係のインストール**:
   ```bash
   # バックエンド
   cd backend
   npm install
   
   # フロントエンド
   cd ../frontend
   npm install
   ```

3. **環境設定**:
   ```bash
   # .env ファイルの作成
   cd ../backend
   cp .env.example .env
   nano .env  # 環境変数を設定
   ```

4. **データベースセットアップ**:
   ```bash
   # PostgreSQLデータベース作成
   sudo -u postgres createdb hontono_kuchikomi
   
   # マイグレーション実行
   DB_USER=postgres DB_PASSWORD=postgres123456 DB_NAME=hontono_kuchikomi DB_HOST=localhost DB_PORT=5432 NODE_ENV=production npx sequelize-cli db:migrate --migrations-path=./src/database/migrations
   ```

5. **PM2構成**:
   ```bash
   # PM2のインストール
   npm install -g pm2
   
   # アプリケーション起動
   cd /var/www/15ch
   pm2 start ecosystem.config.js
   
   # 自動起動設定
   pm2 save
   pm2 startup
   ```

6. **Nginx設定**:
   ```bash
   # 設定ファイル作成
   sudo nano /etc/nginx/sites-available/15ch
   
   # 以下の内容を追加
   server {
       listen 80;
       server_name 15ch.net www.15ch.net;
       
       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   
   # シンボリックリンク作成
   sudo ln -s /etc/nginx/sites-available/15ch /etc/nginx/sites-enabled/
   
   # 設定テスト
   sudo nginx -t
   
   # Nginx再起動
   sudo systemctl restart nginx
   ```

7. **SSL設定**:
   ```bash
   # Certbotインストール
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   
   # SSL証明書取得
   sudo certbot --nginx -d 15ch.net -d www.15ch.net
   ```

### 更新デプロイ（簡易手順）

```bash
# SSHでサーバー接続
ssh root@38.242.229.94
# パスワード: 5151test

# コード更新
cd /var/www/15ch
git pull

# アプリケーション再起動
pm2 restart all
```

## 🔧 管理・運用ガイド

### データベース操作

1. **マイグレーション実行**:
   ```bash
   cd /var/www/15ch/backend
   DB_USER=postgres DB_PASSWORD=postgres123456 DB_NAME=hontono_kuchikomi DB_HOST=localhost DB_PORT=5432 NODE_ENV=production npx sequelize-cli db:migrate --migrations-path=./src/database/migrations
   ```

2. **マイグレーション状態確認**:
   ```bash
   DB_USER=postgres DB_PASSWORD=postgres123456 DB_NAME=hontono_kuchikomi DB_HOST=localhost DB_PORT=5432 NODE_ENV=production npx sequelize-cli db:migrate:status --migrations-path=./src/database/migrations
   ```

3. **シード実行（初期データ）**:
   ```bash
   DB_USER=postgres DB_PASSWORD=postgres123456 DB_NAME=hontono_kuchikomi DB_HOST=localhost DB_PORT=5432 NODE_ENV=production npx sequelize-cli db:seed:all --seeders-path=./src/database/seeders
   ```

### バックアップと復元

1. **データベースバックアップ**:
   ```bash
   # 日付付きバックアップ作成
   pg_dump -U postgres hontono_kuchikomi > /var/backups/hontono_kuchikomi_$(date +%Y%m%d).sql
   ```

2. **アップロードファイルバックアップ**:
   ```bash
   tar -czf /var/backups/15ch_files_$(date +%Y%m%d).tar.gz /var/www/15ch/backend/uploads
   ```

3. **バックアップの復元**:
   ```bash
   # データベース復元
   psql -U postgres -d hontono_kuchikomi < /var/backups/バックアップファイル名.sql
   
   # ファイル復元
   tar -xzf /var/backups/15ch_files_バックアップ日付.tar.gz -C /
   ```

### アプリケーション管理

1. **プロセス状態確認**:
   ```bash
   pm2 status
   ```

2. **ログ監視**:
   ```bash
   # すべてのログ
   pm2 logs
   
   # バックエンドのみ
   pm2 logs 15ch-backend
   
   # フロントエンドのみ
   pm2 logs 15ch-frontend
   ```

3. **アプリケーション再起動**:
   ```bash
   # 全プロセス再起動
   pm2 restart all
   
   # 個別再起動
   pm2 restart 15ch-backend
   pm2 restart 15ch-frontend
   ```

### モニタリング

- **サーバー状態**: `htop`、`df -h`、`free -m`コマンドで確認
- **Nginx状態**: `systemctl status nginx`で確認
- **アクセスログ**: `/var/log/nginx/access.log`を分析

## 📊 プロジェクト詳細

### 主要機能

- **ユーザー管理**: 
  - 登録、ログイン、プロフィール編集
  - スクリーンショット提出による承認プロセス
  - 管理者・一般ユーザー権限分離

- **掲示板機能**: 
  - カテゴリ別スレッド作成
  - 投稿、引用、リアルタイム更新
  - アンカー機能（他投稿参照）

- **店舗情報機能**:
  - スレッドヘッダーでの店舗情報表示
  - 店舗URL、詳細情報の管理
  - 管理者による編集

- **モデレーション**:
  - 投稿の編集・削除
  - ユーザー承認管理
  - 不適切コンテンツ対応

### 管理者アクセス

- **管理者ダッシュボード**: https://15ch.net/admin/
- **管理者ログイン**: https://15ch.net/admin/login.html
  - 管理者権限を持つアカウントでのみアクセス可能

## ❓ トラブルシューティング

### 一般的な問題

1. **サイトにアクセスできない**:
   - Nginxの状態確認: `systemctl status nginx`
   - アプリケーションの状態確認: `pm2 status`
   - ログの確認: `pm2 logs` および `/var/log/nginx/error.log`

2. **APIエラー**:
   - バックエンドログの確認: `pm2 logs 15ch-backend`
   - データベース接続確認: `psql -U postgres -d hontono_kuchikomi -c "\dt"`
   - 環境変数の確認: `.env`ファイルの内容確認

3. **デプロイ後の変更が反映されない**:
   - ブラウザキャッシュのクリア
   - PM2の再起動確認: `pm2 restart all`
   - 正しいブランチにいるか確認: `git branch --show-current`

### GitHub Actionsの問題

1. **テスト失敗**:
   - GitHub Actionsのログでエラーを確認
   - ローカルでテストを実行して再現確認
   - データベース接続設定を確認

2. **ビルドエラー**:
   - 依存関係の問題がないか確認
   - Node.jsバージョン互換性の確認

## 📚 関連ドキュメント

- [技術仕様書](./docs/TECHNICAL_SPECS.md) - 技術スタックやアーキテクチャの詳細
- [API仕様書](./docs/API_SPECS.md) - APIエンドポイントの詳細
- [開発ガイド](./docs/DEVELOPMENT_GUIDE.md) - 開発環境構築と貢献方法
- [機能仕様書](./docs/FUNCTIONAL_SPECS.md) - 詳細な機能要件と仕様

## 🔮 拡張計画

今後計画されている主な拡張・改善：

1. **リアルタイム通知機能**: WebSocketを利用した通知システム
2. **高度な検索機能**: 投稿内容の全文検索
3. **リアクション機能**: 「参考になった」などのリアクション
4. **モバイルアプリ対応**: REST APIを活用したモバイルアプリ
5. **統計・分析ダッシュボード**: 詳細な利用統計と分析機能
6. **多言語対応**: 国際化対応の拡張

## 📄 ライセンス

このプロジェクトは非公開ソフトウェアです。無断での複製・配布・改変は禁止されています。

---

© 2024 15ch All Rights Reserved.