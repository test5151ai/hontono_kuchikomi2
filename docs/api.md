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

## 書類管理API

### 書類アップロード
新しい書類をアップロードします。

- **エンドポイント**: `POST /api/users/me/documents`
- **認証**: 必須（ユーザートークン）
- **コンテンツタイプ**: `multipart/form-data`

#### リクエストパラメータ
| パラメータ | タイプ | 必須 | 説明 |
|----------|------|------|------|
| documentFile | File | Yes | アップロードする書類ファイル |
| documentType | String | Yes | 書類の種類（'identity', 'address', 'other'） |
| documentName | String | No | 書類の名前（指定がない場合は元のファイル名） |

#### 成功レスポンス
- **コード**: 201 Created
```json
{
  "success": true,
  "document": {
    "id": "uuid-string",
    "userId": "user-uuid-string",
    "documentPath": "uploads/documents/uuid-filename.ext",
    "documentType": "identity",
    "documentName": "身分証明書",
    "isVerified": false,
    "uploadedAt": "2025-04-06T12:34:56.789Z",
    "createdAt": "2025-04-06T12:34:56.789Z",
    "updatedAt": "2025-04-06T12:34:56.789Z"
  }
}
```

#### エラーレスポンス
- **コード**: 400 Bad Request
```json
{
  "success": false,
  "message": "Invalid document type"
}
```

- **コード**: 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 書類一覧取得
ユーザーの書類一覧を取得します。

- **エンドポイント**: `GET /api/users/me/documents`
- **認証**: 必須（ユーザートークン）

#### 成功レスポンス
- **コード**: 200 OK
```json
{
  "success": true,
  "documents": [
    {
      "id": "uuid-string-1",
      "userId": "user-uuid-string",
      "documentPath": "uploads/documents/uuid-filename1.ext",
      "documentType": "identity",
      "documentName": "身分証明書",
      "isVerified": true,
      "verifiedAt": "2025-04-07T10:11:12.789Z",
      "verifiedBy": "admin-uuid-string",
      "uploadedAt": "2025-04-06T12:34:56.789Z",
      "createdAt": "2025-04-06T12:34:56.789Z",
      "updatedAt": "2025-04-07T10:11:12.789Z"
    },
    {
      "id": "uuid-string-2",
      "userId": "user-uuid-string",
      "documentPath": "uploads/documents/uuid-filename2.ext",
      "documentType": "address",
      "documentName": "住所証明書",
      "isVerified": false,
      "uploadedAt": "2025-04-06T13:45:67.890Z",
      "createdAt": "2025-04-06T13:45:67.890Z",
      "updatedAt": "2025-04-06T13:45:67.890Z"
    }
  ]
}
```

### 書類削除
指定した書類を削除します。

- **エンドポイント**: `DELETE /api/users/me/documents/:documentId`
- **認証**: 必須（ユーザートークン）

#### URL パラメータ
| パラメータ | 説明 |
|----------|------|
| documentId | 削除する書類のID |

#### 成功レスポンス
- **コード**: 200 OK
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

#### エラーレスポンス
- **コード**: 404 Not Found
```json
{
  "success": false,
  "message": "Document not found"
}
```

### 管理者向け - ユーザー書類一覧取得
管理者が特定ユーザーの書類一覧を取得します。

- **エンドポイント**: `GET /api/admin/users/:userId/documents`
- **認証**: 必須（管理者トークン）

#### URL パラメータ
| パラメータ | 説明 |
|----------|------|
| userId | ユーザーID |

#### 成功レスポンス
- **コード**: 200 OK
```json
{
  "success": true,
  "documents": [
    {
      "id": "uuid-string-1",
      "userId": "user-uuid-string",
      "documentPath": "uploads/documents/uuid-filename1.ext",
      "documentType": "identity",
      "documentName": "身分証明書",
      "isVerified": true,
      "verifiedAt": "2025-04-07T10:11:12.789Z",
      "verifiedBy": "admin-uuid-string",
      "uploadedAt": "2025-04-06T12:34:56.789Z",
      "createdAt": "2025-04-06T12:34:56.789Z",
      "updatedAt": "2025-04-07T10:11:12.789Z"
    },
    // 他の書類...
  ]
}
```

### 管理者向け - 書類承認/拒否
管理者がユーザーの書類を承認または拒否します。

- **エンドポイント**: `PATCH /api/admin/documents/:documentId/verify`
- **認証**: 必須（管理者トークン）
- **コンテンツタイプ**: `application/json`

#### URL パラメータ
| パラメータ | 説明 |
|----------|------|
| documentId | 書類ID |

#### リクエストボディ
```json
{
  "isVerified": true,  // true: 承認, false: 拒否
  "rejectReason": "string"  // 拒否の場合のみ必要
}
```

#### 成功レスポンス
- **コード**: 200 OK
```json
{
  "success": true,
  "document": {
    "id": "uuid-string-1",
    "userId": "user-uuid-string",
    "documentPath": "uploads/documents/uuid-filename1.ext",
    "documentType": "identity",
    "documentName": "身分証明書",
    "isVerified": true,
    "verifiedAt": "2025-04-07T10:11:12.789Z",
    "verifiedBy": "admin-uuid-string",
    "uploadedAt": "2025-04-06T12:34:56.789Z",
    "createdAt": "2025-04-06T12:34:56.789Z",
    "updatedAt": "2025-04-07T10:11:12.789Z"
  }
}
``` 