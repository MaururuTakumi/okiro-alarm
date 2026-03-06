# Alarm App - Alarmy Clone

React Native + Expo で構築したアラームアプリ。ミッション機能で確実に起床できる。

## セットアップ

```bash
# 依存パッケージのインストール
npm install

# 開発サーバー起動
npx expo start
```

Expo Go アプリでQRコードをスキャンして実機確認、または `i` でiOSシミュレーター、`a` でAndroidエミュレーターを起動。

## 機能

### アラーム管理
- アラームの追加・編集・削除
- ON/OFF切り替え
- 曜日リピート設定
- ラベル設定

### ミッション（5種類）
| ミッション | 説明 |
|-----------|------|
| Math | ランダム計算問題（難易度1〜3） |
| Barcode | バーコードスキャンで解除 |
| Photo | カメラ撮影で解除 |
| Steps | 歩数カウント（10〜100歩） |
| Shake | スマホを振る（10〜100回） |

### 多言語対応（i18next）
- 日本語 (ja)
- English (en)
- 中文 (zh)
- 한국어 (ko)

設定画面からリアルタイムに言語切り替え可能。

### テーマ
- ライト / ダークモード切り替え

## プロジェクト構成

```
src/
  contexts/      # AlarmContext, ThemeContext
  locales/       # i18n設定 + 4言語JSONファイル
  screens/       # Home, AlarmSet, Mission, Settings
  utils/         # 型定義, 通知ヘルパー
App.tsx          # エントリポイント（Navigation + Provider設定）
```

## 技術スタック

- Expo SDK 55
- React Navigation (Native Stack + Bottom Tabs)
- i18next + react-i18next
- expo-notifications (バックグラウンド通知)
- expo-camera (バーコード・写真ミッション)
- expo-sensors (歩数・シェイクミッション)
- AsyncStorage (アラーム・設定永続化)
