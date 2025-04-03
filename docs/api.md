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