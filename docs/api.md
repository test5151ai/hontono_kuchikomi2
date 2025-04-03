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