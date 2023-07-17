# ブラックジャックを関数型で書く

## 目的
Qiitaの記事
https://qiita.com/Guvalif/items/a4fe01a4c069836db4d8
の動作を確認し、関数型プログラミングを学ぶ

## 基本情報
ソースコード全体
https://gist.github.com/Guvalif/19dc33579df68c140f6b6d6f013078eb
↓これよりあとに書かれた
プレゼン資料
https://guvalif.github.io/functional-blackjack-v2/1
この新しいソースコードは逐次処理が少なく、改善されている
https://github.com/Guvalif/functional-blackjack-v2/blob/main/index.mjs

→ブラックジャックとしては不完全な、雰囲気実装→このくらいの基本的な例が学習には適している

## ハマった
> npm install ramda # 最初はrambda と間違っていた、rambda はramdaのスモールバージョンとして存在した
> npm install --save folktale

## 動作確認した
ひとまず古いソースコードで
> node main.cjs
で動作確認はできた


