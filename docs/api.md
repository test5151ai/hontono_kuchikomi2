# API仕様書

## 認証

### ログイン
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
    "refreshToken": "string"  // rememberMeがtrueの場合のみ
  }
  ```
- **注意事項**:
  - トークンは`Bearer`プレフィックスなしで返される
  - クライアント側で`Authorization: Bearer {token}`の形式で使用する
  - トークンはLocalStorageに保存（Bearerプレフィックスなし）

### トークン検証
- **エンドポイント**: `GET /api/auth/verify`
- **ヘッダー**: `Authorization: Bearer {token}`
- **レスポンス**:
  ```json
  {
    "valid": "boolean",
    "user": {
      "id": "number",
      "email": "string",
      "username": "string"
    }
  }
  ```

## ユーザーAPI

### ユーザー情報取得
- **エンドポイント**: `GET /api/users/me`
- **ヘッダー**: `Authorization: Bearer {token}`
- **レスポンス**:
  ```json
  {
    "id": "number",
    "email": "string",
    "username": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

### ユーザーの投稿履歴取得
- **エンドポイント**: `GET /api/users/me/posts`
- **ヘッダー**: `Authorization: Bearer {token}`
- **レスポンス**:
  ```json
  [
    {
      "id": "number",
      "title": "string",
      "content": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
  ```

## エラーレスポンス
```json
{
  "error": "string",
  "message": "string"
}
```

## ステータスコード
- 200: 成功
- 400: リクエストエラー
- 401: 認証エラー
- 403: 権限エラー
- 404: リソースが見つからない
- 500: サーバーエラー

## カテゴリー関連API

### カテゴリー一覧の取得

```
GET /api/categories
```

#### レスポンス
```json
[
  {
    "id": "uuid",
    "name": "カテゴリー名",
    "description": "カテゴリーの説明",
    "slug": "category-slug",
    "createdAt": "2024-04-03T07:50:59.038Z",
    "updatedAt": "2024-04-03T07:50:59.038Z"
  }
]
```

### カテゴリー詳細の取得

```
GET /api/categories/:id
```

#### パラメータ
- `id`: カテゴリーのUUID

#### レスポンス
```json
{
  "id": "uuid",
  "name": "カテゴリー名",
  "description": "カテゴリーの説明",
  "slug": "category-slug",
  "createdAt": "2024-04-03T07:50:59.038Z",
  "updatedAt": "2024-04-03T07:50:59.038Z"
}
```

### カテゴリー別スレッド一覧の取得

```
GET /api/categories/:id/threads
```

#### パラメータ
- `id`: カテゴリーのUUID
- `page`: ページ番号（オプション、デフォルト: 1）
- `limit`: 1ページあたりの表示件数（オプション、デフォルト: 20）

#### レスポンス
```json
{
  "threads": [
    {
      "id": "uuid",
      "title": "スレッドタイトル",
      "createdAt": "2024-04-03T07:50:59.038Z"
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

## 管理者用API

### ユーザー管理

#### 承認待ちユーザー一覧の取得
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

#### ユーザーの承認
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

#### ユーザーの一括承認
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

#### 管理者権限の付与
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

### カテゴリー管理

#### カテゴリー一覧の取得（管理者用）
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

#### カテゴリーの作成
- **エンドポイント**: `POST /api/admin/categories`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **リクエスト**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **レスポンス**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "slug": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```

#### カテゴリーの更新
- **エンドポイント**: `PUT /api/admin/categories/:id`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **リクエスト**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **レスポンス**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "slug": "string",
    "updatedAt": "string"
  }
  ```

#### カテゴリーの削除
- **エンドポイント**: `DELETE /api/admin/categories/:id`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "カテゴリーを削除しました"
  }
  ```

#### スレッドの未分類カテゴリーへの移動
- **エンドポイント**: `POST /api/admin/categories/:id/move-threads`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **レスポンス**:
  ```json
  {
    "success": true,
    "message": "スレッドを未分類カテゴリーに移動しました"
  }
  ```

### ダッシュボード

#### ダッシュボード統計情報の取得
- **エンドポイント**: `GET /api/admin/dashboard`
- **ヘッダー**: `Authorization: Bearer {token}`
- **権限**: 管理者のみ
- **レスポンス**:
  ```json
  {
    "success": true,
    "data": {
      "pendingCount": "number",
      "approvedCount": "number",
      "recentUsers": [
        {
          "id": "uuid",
          "username": "string",
          "email": "string",
          "createdAt": "string"
        }
      ]
    }
  }
  ``` 