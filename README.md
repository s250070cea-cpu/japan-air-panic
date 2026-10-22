# ジャパン・エア・パニック 3D オンライン版

## ローカルで試す

1. Node.js 18 以降をインストールします。
2. このフォルダで `npm install` を実行します。
3. `npm start` を実行します。
4. ブラウザで `http://localhost:3000` を開きます。
5. 同じWi-Fiの友達は、ホストPCのローカルIPアドレスを使って `http://ホストのIP:3000` を開きます。

## インターネット越しに共有リンクを作る（Render例）

1. このフォルダの3ファイル（`index.html`, `server.js`, `package.json`）をGitHubリポジトリにアップロードします。
2. Renderで **New → Web Service** を選び、そのリポジトリを接続します。
3. Build Command は `npm install`、Start Command は `npm start` にします。
4. デプロイ後に発行された `https://....onrender.com/` のURLを友達に送ります。
5. 全員が同じURL（同じ `?room=部屋名` があればその値）を開くと同じ部屋に入ります。別の部屋に分ける場合は、URL末尾に `?room=好きな部屋名` を付けます。

## 注意

- WebSocketを利用します。ホスティング側でWebSocket接続が許可されている必要があります。
- これは共有リンク用の初期実装です。4人での実機テスト、切断時の復帰、スマホ操作、ゲームバランスは公開前に確認してください。
