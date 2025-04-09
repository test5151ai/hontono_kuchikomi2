# 15ch - リアルタイム掲示板システム

## 概要

15chは承認制のリアルタイム掲示板システムです。ユーザーはスクリーンショット提出による承認を受けた後に投稿が可能になります。管理者はユーザー承認、カテゴリー管理、コンテンツ管理などの機能を利用できます。

## サーバー管理情報

### 環境設定

- **本番環境**: VPS（さくらのVPS）
- **ドメイン**: https://15ch.net
- **Webサーバー**: Nginx
- **アプリケーションサーバー**: Node.js + PM2
- **データベース**: PostgreSQL

### デプロイ手順

1. **初回デプロイ**:
   ```bash
   # サーバー上での作業
   cd /var/www
   git clone https://github.com/test5151ai/hontono_kuchikomi2.git 15ch
   cd 15ch/backend
   npm install
   cd ../frontend
   npm install
   ```

2. **環境変数の設定**:
   ```bash
   # バックエンド用の.env作成
   cd /var/www/15ch/backend
   cp .env.example .env
   nano .env  # 必要な環境変数を設定
   ```

3. **データベースのセットアップ**:
   ```bash
   # PostgreSQLデータベース作成
   sudo -u postgres createdb hontono_kuchikomi
   
   # マイグレーション実行
   cd /var/www/15ch/backend
   DB_USER=postgres DB_PASSWORD=postgres123456 DB_NAME=hontono_kuchikomi DB_HOST=localhost DB_PORT=5432 NODE_ENV=production npx sequelize-cli db:migrate --migrations-path=./src/database/migrations
   ```

4. **PM2でのアプリケーション起動**:
   ```bash
   # PM2のインストール（未インストールの場合）
   npm install -g pm2
   
   # アプリケーション起動
   cd /var/www/15ch
   pm2 start ecosystem.config.js
   
   # 起動時に自動実行するように設定
   pm2 save
   pm2 startup
   ```

5. **Nginxの設定**:
   ```bash
   # Nginx設定ファイルの作成
   sudo nano /etc/nginx/sites-available/15ch
   
   # 以下の内容を追加（ドメインを適切に設定）
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
   
   # シンボリックリンクの作成
   sudo ln -s /etc/nginx/sites-available/15ch /etc/nginx/sites-enabled/
   
   # Nginx設定テスト
   sudo nginx -t
   
   # Nginx再起動
   sudo systemctl restart nginx
   ```

6. **SSL証明書の設定（Let's Encrypt）**:
   ```bash
   # Certbotのインストール
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   
   # SSL証明書の取得と設定
   sudo certbot --nginx -d 15ch.net -d www.15ch.net
   ```

### 日常の管理と運用

#### コードの更新方法

1. **リポジトリの更新（通常の更新）**:
   ```bash
   cd /var/www/15ch
   git pull
   ```

2. **依存関係の更新（必要に応じて）**:
   ```bash
   cd /var/www/15ch/backend
   npm install
   
   cd /var/www/15ch/frontend
   npm install
   ```

3. **アプリケーションの再起動**:
   ```bash
   pm2 restart all
   ```

#### 簡易更新手順

サイトを更新する際の簡易手順は以下の通りです：
```bash
# SSHでサーバーに接続
ssh root@38.242.229.94
# パスワード: 5151test

# アプリケーションディレクトリに移動
cd /var/www/15ch

# GitHubから最新のコードを取得
git pull

# アプリケーションを再起動
pm2 restart all
```

#### データベース操作

1. **マイグレーションの実行**:
   ```bash
   cd /var/www/15ch/backend
   DB_USER=postgres DB_PASSWORD=postgres123456 DB_NAME=hontono_kuchikomi DB_HOST=localhost DB_PORT=5432 NODE_ENV=production npx sequelize-cli db:migrate --migrations-path=./src/database/migrations
   ```

2. **特定のマイグレーションまで実行**:
   ```bash
   DB_USER=postgres DB_PASSWORD=postgres123456 DB_NAME=hontono_kuchikomi DB_HOST=localhost DB_PORT=5432 NODE_ENV=production npx sequelize-cli db:migrate:to --to ファイル名.js --migrations-path=./src/database/migrations
   ```

3. **マイグレーションの状態確認**:
   ```bash
   DB_USER=postgres DB_PASSWORD=postgres123456 DB_NAME=hontono_kuchikomi DB_HOST=localhost DB_PORT=5432 NODE_ENV=production npx sequelize-cli db:migrate:status --migrations-path=./src/database/migrations
   ```

#### バックアップ

1. **データベースのバックアップ**:
   ```bash
   pg_dump -U postgres hontono_kuchikomi > /var/backups/hontono_kuchikomi_$(date +%Y%m%d).sql
   ```

2. **ファイルのバックアップ**:
   ```bash
   tar -czf /var/backups/15ch_files_$(date +%Y%m%d).tar.gz /var/www/15ch/backend/uploads
   ```

#### トラブルシューティング

1. **ログの確認**:
   ```bash
   # PM2ログの確認
   pm2 logs
   
   # 特定のアプリケーションのログ
   pm2 logs 15ch-backend
   pm2 logs 15ch-frontend
   
   # Nginxのエラーログ
   sudo tail -f /var/log/nginx/error.log
   ```

2. **アプリケーションの再起動**:
   ```bash
   pm2 restart 15ch-backend
   pm2 restart 15ch-frontend
   # または
   pm2 restart all
   ```

3. **Nginxの再起動**:
   ```bash
   sudo systemctl restart nginx
   ```

4. **アプリケーションステータスの確認**:
   ```bash
   pm2 status
   ```

## プロジェクト詳細

### 機能概要

- **ユーザー管理**: 登録、ログイン、プロフィール編集、管理者承認
- **掲示板機能**: スレッド作成、投稿、リアルタイム更新
- **カテゴリー管理**: 管理者によるカテゴリー追加・編集
- **管理機能**: ユーザー承認、コンテンツ管理、統計情報

### 管理者用アクセス情報

- **管理者ダッシュボード**: https://15ch.net/admin/
- **管理者専用ログイン画面**: https://15ch.net/admin/login.html
  - 管理者権限を持つアカウントでログインしてください
  - 一般ユーザーアカウントでは管理画面にアクセスできません

### 関連ドキュメント

- [技術仕様書](./docs/TECHNICAL_SPECS.md) - 技術スタックやアーキテクチャの詳細
- [API仕様書](./docs/API_SPECS.md) - APIエンドポイントの詳細
- [開発ガイド](./docs/DEVELOPMENT_GUIDE.md) - 開発環境構築と貢献方法
- [機能仕様書](./docs/FUNCTIONAL_SPECS.md) - 詳細な機能要件と仕様

## 拡張計画

今後計画されている主な拡張・改善は以下の通りです：

1. **リアルタイム通知機能**: WebSocketを利用した通知システム
2. **高度な検索機能**: 投稿内容の全文検索
3. **リアクション機能**: 「参考になった」などのリアクション
4. **モバイルアプリ対応**: REST APIを活用したモバイルアプリの開発
5. **統計・分析ダッシュボード**: 詳細な利用統計と分析機能

## ライセンス

このプロジェクトは非公開ソフトウェアです。無断での複製・配布・改変は禁止されています。

---

© 2024 15ch All Rights Reserved.