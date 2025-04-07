# API仕様書

## 1. 認証関連API

### 1.1 ユーザー登録
- **エンドポイント**: `POST /api/auth/register`
- **リクエスト**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "submissionMethod": "string", // 'email' または 'line'
    "submissionContact": "string" // メールアドレスまたはLINE ID
  }
  ```
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "登録が完了しました。承認をお待ちください。",
    "userId": "uuid"
  }
  ```

### 1.2 ログイン
- **エンドポイント**: `POST /api/auth/login`
- **リクエスト**:
  ```json
  {
    "email": "string",
    "password": "string",
    "rememberMe": "boolean"
  }
  ```
- **レスポンス**:
  ```json
  {
    "token": "string",  // BearerプレフィックスなしのJWTトークン
    "refreshToken": "string",  // rememberMeがtrueの場合のみ
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "string"
    }
  }
  ```
- **注意事項**:
  - トークンは`Bearer`プレフィックスなしで返される
  - クライアント側で`Authorization: Bearer {token}`の形式で使用する
  - トークンはLocalStorageに保存（Bearerプレフィックスなし）

### 1.3 トークン検証
- **エンドポイント**: `GET /api/auth/verify`
- **ヘッダー**: `Authorization: Bearer {token}`
- **レスポンス**:
  ```json
  {
    "valid": "boolean",
    "user": {
      "id": "uuid",
      "email": "string",
      "username": "string",
      "role": "string"
    }
  }
  ```

### 1.4 ログアウト
- **エンドポイント**: `GET /api/auth/logout`
- **ヘッダー**: `Authorization: Bearer {token}`
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "ログアウトしました"
  }
  ```

## 2. ユーザーAPI

### 2.1 ユーザー情報取得
- **エンドポイント**: `GET /api/users/me`
- **ヘッダー**: `Authorization: Bearer {token}`
- **レスポンス**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "username": "string",
    "role": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### 2.2 ユーザー情報更新
- **エンドポイント**: `PUT /api/users/me`
- **ヘッダー**: `Authorization: Bearer {token}`
- **リクエスト**:
  ```json
  {
    "username": "string",
    "icon": "string"
  }
  ```
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "プロフィールを更新しました",
    "user": {
      "id": "uuid",
      "email": "string",
      "username": "string",
      "icon": "string"
    }
  }
  ```

### 2.3 書類アップロード
- **エンドポイント**: `POST /api/users/documents`
- **ヘッダー**: `Authorization: Bearer {token}`
- **リクエスト**: `multipart/form-data`
  - `file`: ファイル（最大5MB、jpg/jpeg/png）
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "書類がアップロードされました",
    "document": {
      "id": "uuid",
      "originalFilename": "string",
      "fileType": "string",
      "fileSize": "number",
      "status": "pending",
      "createdAt": "string"
    }
  }
  ```

### 2.4 書類一覧取得
- **エンドポイント**: `GET /api/users/documents`
- **ヘッダー**: `Authorization: Bearer {token}`
- **レスポンス**:
  ```json
  {
    "documents": [
      {
        "id": "uuid",
        "originalFilename": "string",
        "fileType": "string",
        "fileSize": "number",
        "status": "string",
        "createdAt": "string",
        "reviewedAt": "string"
      }
    ]
  }
  ```

### 2.5 書類削除
- **エンドポイント**: `DELETE /api/users/documents/:id`
- **ヘッダー**: `Authorization: Bearer {token}`
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "書類が削除されました"
  }
  ```

## 3. カテゴリー関連API

### 3.1 カテゴリー一覧の取得
- **エンドポイント**: `GET /api/categories`
- **レスポンス**:
  ```json
  [
    {
      "id": "uuid",
      "name": "カテゴリー名",
      "description": "カテゴリーの説明",
      "slug": "category-slug",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

### 3.2 カテゴリー詳細の取得
- **エンドポイント**: `GET /api/categories/:id`
- **パラメータ**:
  - `id`: カテゴリーのUUID
- **レスポンス**:
  ```json
  {
    "id": "uuid",
    "name": "カテゴリー名",
    "description": "カテゴリーの説明",
    "slug": "category-slug",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### 3.3 カテゴリー別スレッド一覧の取得
- **エンドポイント**: `GET /api/categories/:id/threads`
- **パラメータ**:
  - `id`: カテゴリーのUUID
  - `page`: ページ番号（オプション、デフォルト: 1）
  - `limit`: 1ページあたりの表示件数（オプション、デフォルト: 20）
- **レスポンス**:
  ```json
  {
    "threads": [
      {
        "id": "uuid",
        "title": "スレッドタイトル",
        "createdAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "totalItems": 100
    }
  }
  ```

## 4. スレッド・投稿関連API

### 4.1 スレッド一覧の取得
- **エンドポイント**: `GET /api/threads`
- **パラメータ**:
  - `page`: ページ番号（オプション、デフォルト: 1）
  - `limit`: 1ページあたりの表示件数（オプション、デフォルト: 20）
- **レスポンス**:
  ```json
  {
    "threads": [
      {
        "id": "uuid",
        "title": "スレッドタイトル",
        "categoryId": "uuid",
        "categoryName": "カテゴリー名",
        "createdAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalPages": 5,
      "totalItems": 100
    }
  }
  ```

### 4.2 スレッド詳細の取得
- **エンドポイント**: `GET /api/threads/:id`
- **パラメータ**:
  - `id`: スレッドのUUID
- **レスポンス**:
  ```json
  {
    "id": "uuid",
    "title": "スレッドタイトル",
    "categoryId": "uuid",
    "categoryName": "カテゴリー名",
    "authorId": "uuid",
    "authorName": "作成者名",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### 4.3 スレッド作成
- **エンドポイント**: `POST /api/threads`
- **ヘッダー**: `Authorization: Bearer {token}`
- **リクエスト**:
  ```json
  {
    "title": "スレッドタイトル",
    "categoryId": "uuid",
    "content": "最初の投稿内容"
  }
  ```
- **レスポンス**:
  ```json
  {
    "success": true,
    "thread": {
      "id": "uuid",
      "title": "スレッドタイトル",
      "categoryId": "uuid",
      "authorId": "uuid",
      "createdAt": "string"
    }
  }
  ```

### 4.4 スレッド内の投稿一覧取得
- **エンドポイント**: `GET /api/threads/:id/posts`
- **パラメータ**:
  - `id`: スレッドのUUID
  - `page`: ページ番号（オプション、デフォルト: 1）
  - `limit`: 1ページあたりの表示件数（オプション、デフォルト: 50）
- **レスポンス**:
  ```json
  {
    "posts": [
      {
        "id": "uuid",
        "content": "投稿内容",
        "authorId": "uuid",
        "authorName": "投稿者名",
        "authorIcon": "アイコン名",
        "helpfulCount": 5,
        "createdAt": "string"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalPages": 2,
      "totalItems": 75
    }
  }
  ```

### 4.5 投稿の作成
- **エンドポイント**: `POST /api/threads/:id/posts`
- **ヘッダー**: `Authorization: Bearer {token}`
- **パラメータ**:
  - `id`: スレッドのUUID
- **リクエスト**:
  ```json
  {
    "content": "投稿内容"
  }
  ```
- **レスポンス**:
  ```json
  {
    "success": true,
    "post": {
      "id": "uuid",
      "content": "投稿内容",
      "authorId": "uuid",
      "authorName": "投稿者名",
      "threadId": "uuid",
      "createdAt": "string"
    }
  }
  ```

## 5. 管理者用API

### 5.1 承認待ちユーザー一覧の取得
- **エンドポイント**: `GET /api/admin/users/pending`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **レスポンス**:
  ```json
  {
    "users": [
      {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "submissionMethod": "string",
        "submissionContact": "string",
        "createdAt": "string"
      }
    ]
  }
  ```

### 5.2 ユーザーの承認
- **エンドポイント**: `POST /api/admin/users/:id/approve`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "ユーザーを承認しました"
  }
  ```

### 5.3 ユーザーの一括承認
- **エンドポイント**: `POST /api/admin/users/bulk-approve`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **リクエスト**:
  ```json
  {
    "userIds": ["uuid"]
  }
  ```
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "選択したユーザーを承認しました"
  }
  ```

### 5.4 管理者権限の付与
- **エンドポイント**: `POST /api/admin/users/:id/grant-admin`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "管理者権限を付与しました"
  }
  ```

### 5.5 カテゴリー管理API
- **エンドポイント**: `GET /api/admin/categories`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **レスポンス**:
  ```json
  {
    "categories": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "slug": "string",
        "threadCount": "number",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ]
  }
  ```

### 5.6 カテゴリー作成
- **エンドポイント**: `POST /api/admin/categories`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **リクエスト**:
  ```json
  {
    "name": "string",
    "description": "string",
    "slug": "string"
  }
  ```
- **レスポンス**:
  ```json
  {
    "success": true,
    "category": {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "slug": "string",
      "createdAt": "string"
    }
  }
  ```

## 6. エラーレスポンス

すべてのAPIエラーは以下の形式で返されます:
```json
{
  "error": "string",
  "message": "string"
}
```

## 7. ステータスコード
- 200: 成功
- 201: 作成成功
- 400: リクエストエラー
- 401: 認証エラー
- 403: 権限エラー
- 404: リソースが見つからない
- 500: サーバーエラー 