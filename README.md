# 発注管理システム｜株式会社合格

## デプロイ手順

### 1. Vercel環境変数を設定
Vercel ダッシュボード → プロジェクト → Settings → Environment Variables

| 変数名 | 値 |
|---|---|
| NOTION_TOKEN | 発注管理システムのAPIキー |
| NOTION_HEADER_DB_ID | 278e910ed5d94aeeb14967a74eeecbf4 |
| NOTION_DETAIL_DB_ID | d777ad3a0619489f9739382936dff12b |
| NOTION_PRODUCT_DB_ID | 274fbeb7c71d80edac25c16a51bf0167 |

### 2. GitHubにプッシュ → Vercelが自動デプロイ

## DB構成
- 発注ヘッダDB: 278e910ed5d94aeeb14967a74eeecbf4
- 発注明細DB: d777ad3a0619489f9739382936dff12b
- ユーザーマスタDB: c5f27286721e4d1485a0c1c1f7409067
- 商品マスタDB: 274fbeb7c71d80edac25c16a51bf0167
