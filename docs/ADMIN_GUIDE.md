# 管理者ガイド

## 1. はじめに

このガイドは15chの管理者ダッシュボードの使用方法について説明します。管理者ダッシュボードは、サイト管理者がユーザー、カテゴリー、スレッドを管理するためのツールです。

## 2. 管理者ダッシュボードへのアクセス

管理者ダッシュボードには以下のURLからアクセスできます：
```
https://15ch.net/admin/
```

### 2.1 アクセス権限

管理者ダッシュボードへのアクセスには以下のロールが必要です：
- **管理者（admin）**
- **スーパーユーザー（superuser）**
- **システム管理者（system_admin）**

一般ユーザーは管理者ダッシュボードにアクセスできません。

### 2.2 ログイン情報

管理者権限を持つアカウント：
- **管理者**: kanriudon@gmail.com / udon1234
- **スーパーユーザー**: superudon@gmail.com / udon1234
- **システム管理者**: admin@15ch.net / superadmin1234

## 3. ダッシュボード概要

ダッシュボードのメイン画面では、以下の情報が一目で確認できます：

- **承認待ちユーザー数**: 承認待ちのユーザーアカウント数
- **登録ユーザー数**: 承認済みの登録ユーザー総数
- **カテゴリー数**: 登録されているカテゴリーの総数
- **スレッド数**: 作成されているスレッドの総数
- **最近のアクティビティ**: システム内の最近の活動記録
- **システム情報**: サーバーおよびデータベースの状態

## 4. ユーザー管理

### 4.1 ユーザー一覧

「ユーザー」メニューでは、承認済みのすべてのユーザーを管理できます。

主な機能：
- **ユーザー検索**: ユーザー名やメールアドレスで検索
- **ユーザー情報の表示**: ユーザー名、メール、ロール、登録日時などの情報表示
- **ユーザー編集**: ユーザー情報の編集（ロール変更など）
- **アカウント停止/復活**: 問題のあるユーザーのアカウント停止と復活
- **ユーザー削除**: アカウントの完全削除（注意: この操作は元に戻せません）

### 4.2 承認待ちユーザー

「承認待ちユーザー」メニューでは、新規登録したユーザーの承認作業を行います。

主な機能：
- **ユーザー承認**: 個別ユーザーの承認
- **ユーザー拒否**: 承認拒否（拒否理由の入力可能）
- **一括承認**: 選択した複数ユーザーの一括承認
- **詳細確認**: ユーザーの詳細情報の確認

承認プロセス：
1. ユーザーリストから承認するユーザーを選択
2. 「承認」ボタンをクリックするか、複数選択して「一括承認」
3. 拒否する場合は「拒否」ボタンをクリック後、理由を入力

## 5. カテゴリー管理

「カテゴリー」メニューでは、掲示板のカテゴリーを管理できます。

主な機能：
- **カテゴリー一覧**: 登録されている全カテゴリーの表示
- **カテゴリー追加**: 新規カテゴリーの追加
- **カテゴリー編集**: 既存カテゴリーの名前、説明、表示順の編集
- **カテゴリー削除**: 不要になったカテゴリーの削除

注意事項：
- カテゴリーを削除すると、そのカテゴリーに属するスレッドは「未分類」カテゴリーに移動します
- カテゴリー名は一意である必要があります
- 表示順は数字が小さいほど上位に表示されます

## 6. スレッド管理

「スレッド」メニューでは、ユーザーが作成したスレッドを管理できます。

主な機能：
- **スレッド一覧**: 作成された全スレッドの表示
- **スレッド検索**: タイトルや内容による検索
- **カテゴリーフィルター**: カテゴリーによるフィルタリング
- **スレッド編集**: スレッドのタイトル、内容、カテゴリーの編集
- **スレッド削除**: 不適切なスレッドの削除
- **スレッド固定/解除**: 重要なスレッドの固定表示設定

モデレーション機能：
- **内容確認**: スレッド内容の詳細確認
- **コメント管理**: スレッド内のコメントの管理
- **通報対応**: ユーザーからの通報内容の確認と対応

## 7. 統計情報

「統計」メニューでは、サイト全体の利用状況や統計情報を確認できます。

主な機能：
- **アクセス統計**: 日別/月別のアクセス数グラフ
- **ユーザー統計**: 新規登録ユーザー数の推移
- **コンテンツ統計**: スレッド・コメント数の推移
- **人気カテゴリー**: カテゴリー別アクセス数ランキング
- **人気スレッド**: アクセス数・コメント数の多いスレッドランキング

## 8. システム設定

管理者は「システム設定」メニューからサイト全体の設定を変更できます。

主な設定項目：
- **サイト基本設定**: サイト名、説明文などの基本情報
- **表示設定**: トップページの表示項目や表示順の設定
- **ユーザー設定**: 新規登録の許可/禁止、承認プロセスの有効/無効
- **コンテンツ設定**: 投稿制限、禁止ワードの設定など
- **メールテンプレート**: 各種通知メールの内容編集

## 9. トラブルシューティング

管理者ダッシュボード使用中に問題が発生した場合は、以下を確認してください：

### 9.1 アクセスできない場合
- ログイン状態を確認（再ログイン）
- 管理者権限を持っているか確認
- ブラウザのキャッシュをクリア

### 9.2 データが表示されない場合
- ネットワーク接続を確認
- ブラウザの開発者ツールでエラーを確認
- サーバーログでエラーを確認（`/root/.pm2/logs/15ch-backend-error.log`）

### 9.3 操作が反映されない場合
- ページのリロードを試す
- 別のブラウザでアクセスを試す
- サーバーの状態を確認（`pm2 status`）

## 10. セキュリティ注意事項

管理者として以下のセキュリティ対策を必ず実施してください：

- **パスワード管理**: 強力なパスワードを使用し、定期的に変更する
- **アクセス制限**: 信頼できるネットワークからのみアクセスする
- **セッション管理**: 作業終了後は必ずログアウトする
- **権限付与**: 必要最小限の権限のみを付与する
- **操作ログ**: 重要な操作は記録を残す

## 11. 参考リソース

- **開発ガイド**: `/docs/DEVELOPMENT_GUIDE.md`
- **API仕様書**: `/docs/API_SPECS.md`
- **機能仕様書**: `/docs/FUNCTIONAL_SPECS.md`
- **技術仕様書**: `/docs/TECHNICAL_SPECS.md`

---

このガイドに関する質問や提案があれば、システム管理者（admin@15ch.net）に連絡してください。 