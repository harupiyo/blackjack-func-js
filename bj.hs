import qualified System.Random  -- 要インストール $ stack ghci --package random
import qualified Control.Monad.IO.Class

-- 用語
-- https://ja.wikipedia.org/wiki/%E3%83%88%E3%83%A9%E3%83%B3%E3%83%97#%E6%97%A5%E6%9C%AC%E3%81%A7%E4%B8%80%E8%88%AC%E7%9A%84%E3%81%AA%E3%82%AB%E3%83%BC%E3%83%89 より
-- スペード、ハート、クラブ、ダイヤの4種のスート（絵柄マーク）に分かれており、各スートには13の「ランク」（番号）の札がある。
type Point = [Int]
type Card = String

pointTable :: [(Card,Point)]
pointTable = [("A"   ,[ 1, 11 ])
             ,("N2"  ,[ 2 ])
             ,("N3"  ,[ 3 ])
             ,("N4"  ,[ 4 ])
             ,("N5"  ,[ 5 ])
             ,("N6"  ,[ 6 ])
             ,("N7"  ,[ 7 ])
             ,("N8"  ,[ 8 ])
             ,("N9"  ,[ 9 ])
             ,("N10" ,[ 10 ])
             ,("J"   ,[ 10 ])
             ,("Q"   ,[ 10 ])
             ,("K"   ,[ 10 ])]

-- 1〜13までのカードを４スート集めて13*4 のデッキを作る
-- pointTable からキーだけを選択するには？
-- ghci> map (\(k,v) -> k) pointTable
-- ["A","N2","N3","N4","N5","N6","N7","N8","N9","N10","J","Q","K"]
-- これを４回繰り返すには？
-- ghci> take 4 $ repeat $ map (\(k,v) -> k) pointTable
-- [["A","N2","N3","N4","N5","N6","N7","N8","N9","N10","J","Q","K"],["A","N2","N3","N4","N5","N6","N7","N8","N9","N10","J","Q","K"],["A","N2","N3","N4","N5","N6","N7","N8","N9","N10","J","Q","K"],["A","N2","N3","N4","N5","N6","N7","N8","N9","N10","J","Q","K"]]
-- このリストをフラットにするには？[[],[],[],[]] -> []
-- https://hoogle.haskell.org/?hoogle=%5B%5Ba%5D%5D+-%3E+%5Ba%5D&scope=set%3Astackage
-- →concat が使えそう
-- ghci> concat $ take 4 $ repeat $ map (\(k,v) -> k) pointTable
-- ["A","N2","N3","N4","N5","N6","N7","N8","N9","N10","J","Q","K","A","N2","N3","N4","N5","N6","N7","N8","N9","N10","J","Q","K","A","N2","N3","N4","N5","N6","N7","N8","N9","N10","J","Q","K","A","N2","N3","N4","N5","N6","N7","N8","N9","N10","J","Q","K"]
 
deck :: [Card]
deck = concat $ take 4 $ repeat $ map (\(k,v) -> k) pointTable

-- -- suit から該当するランクの点数を得るには？ toPoint の実装
-- ghci> snd $ head $ filter (\(k,v) -> k == "N3") pointTable
-- [3]

toPoint :: Card -> Point
toPoint c = snd $ head $ filter (\(k,v) -> k == c) pointTable

-- toPoint x = point . head . filter (\c -> rank c == x) $ suit
-- -- ghci> toPoint "A"
-- -- [1,11]
-- -- ghci> toPoint "N2"
-- -- [2]

-- 手持ちのカードの束を点数のリストに置き換える toPoints
toPoints :: [Card] -> [Point]
toPoints = map toPoint
-- ghci> toPoints ["A","N2"]
-- [[1,11],[2]]

-- const add2 = R.lift(R.add) の実装
-- https://guvalif.github.io/functional-blackjack-v2/9
-- このadd2 は、(+) の関数をリストの演算をするように持ち上げている
-- 通常の足し算を、非決定的演算へと持ち上げている
-- console.log( R.lift(R.add)([1,2],[3,4]) )	// [4,5,5,6]
-- ghci> (+) <$> [1,2] <*> [3,4]  -- これはアプリカティブ・スタイル
-- [4,5,5,6]
-- ghci> add2 [1,2] [3] -- それぞれのリストの数が異なっていてもいい
-- [4,5]


addA2 :: Point -> Point -> Point
addA2 x y = (+) <$> x <*> y
-- ghci> addA2 [1,2] [3,4]
-- [4,5,5,6]

-- calcScore の実装
-- calcScores = R.reduce(addA2, [ 0 ])
-- これは取りうる合計点数の非決定的値になる
-- https://guvalif.github.io/functional-blackjack-v2/10 に具体的に説明あり
--     calcScore([[1,11],[1,11],[10]]) は [12,22,22,32] になる（概要）
--     これは、[0] + [1,11] + [1,11] + [10]をしている(+はAddA2)
-- R.reduceに相当するのは、foldl かfoldr か
-- すごいHaskell 5.5→foldl でいいんじゃね？
-- ghci> foldl add2 [0] $ [[1,11], [1,11], [10]]
-- [12,22,22,32]
-- ghci> foldr add2 [0] $ [[1,11], [1,11], [10]]
-- [12,22,22,32]
-- →foldl でもfoldr でも同じ結果になるね→foldl で
-- また、この場合はfoldl1 が便利だ
-- ghci> foldl1 add2 $ [[1,11], [1,11], [10]]
-- [12,22,22,32]

calcScore :: [Point] -> [Int]
calcScore = foldl1 addA2
-- ghci> calcScore [[1,11],[1,11],[10]]
-- [12,22,22,32]

-- 点数の候補から最高得点を選出(ただし、22以上はドボン)
-- const extractValidScore = R.pipe(
-- 	R.filter(R.gte(21)),		// 21以内で
-- 	(xs) => Math.max(...xs),	// 最高値
-- 	Maybe.fromPredicate((x) => x !== - Infinity),	// Math.max は引数がない場合には -Infinity を返す
-- );
-- 
-- まず、21以内のフィルター
-- ghci> filter (\x -> x <= 21) [12,22,22,32]
-- [12]
-- ghci> filter (<= 21) [12,22,22,32]	-- こうも書ける
-- 
-- 次に、最大値を得る
-- ghci> :t max
-- max :: Ord a => a -> a -> a		-- haskell のmax は２引数関数
-- ghci> max 2 3
-- 3
-- リストを対象にするには折りたたみを使う
-- ghci> foldl1 max [1,2,3,10,5,3]
-- 10
-- ghci> foldl max []	 -- ただし、空リストはエラーなので、この前に空かどうかを判断する必要がある
-- *** Exception: Prelude.foldl1: empty list

-- リストが空かどうかでMaybe を返すには
test :: [Int] -> Maybe Int
test list@(x:xs) = Just (foldl1 max $ list) 
test (x) = Nothing
-- ghci> test [1,3,5,4,2]
-- Just 5
-- ghci> test []
-- Nothing

extractValidScore :: [Int] -> Maybe Int
extractValidScore xs = test $ filter (<= 21) $ xs

-- ghci> extractValidScore []
-- Nothing
-- ghci> extractValidScore [1,3,10,7,21,22,32]
-- Just 21


-- shuffleSuit は難しそうだ！
-- https://wiki.haskell.org/Random_shuffle 
-- shuffleSuit = id  -- ひとまずシャッフルしないでしのいでみる
--                   -- あとでシャッフルに入れ替えるつもりだが、そうするとIOモナドとして帰ってくるのかな、そうしたら後のコードも書き換えないとだめになるな
-- なので、やはりここでシャッフルは手にいれておくべきだ
-- https://programming-idioms.org/idiom/10/shuffle-a-list/826/haskell より
shuffle :: Control.Monad.IO.Class.MonadIO m => [a] -> m [a] -- IOモナドが登場する
shuffle x = if length x < 2 then return x else do
  i <- System.Random.randomRIO (0, length(x)-1)
  r <- shuffle (take i x ++ drop (i+1) x)
  return (x!!i : r)

-- ghci> shuffle [1,2,3]
-- [2,3,1]
-- ghci> shuffle [1,2,3]
-- [2,1,3]
-- IOモナドの扱いについてはまた後で調べる

-- shuffleSuit' :: Control.Monad.IO.Class.MonadIO m => [Card] -> m [Card]
-- shuffleSuit' xs = shuffle xs
-- ghci> shuffle' deck
-- ["N3","K","N8","A","Q","N8","N2","A","N9","K","N4","N4","J","N4","N4","N3","N6","J","N9","N9","N10","N2","N7","N2","A","N3","Q","Q","N8","N10","N2","N6","J","N7","N5","N10","N5","N8","Q","N5","N7","N6","N6","N5","N3","N10","N9","K","K","A","N7","J"]
shuffleSuit :: Control.Monad.IO.Class.MonadIO m => m [Card]
shuffleSuit = shuffle deck
-- ghci> shuffleSuit
-- ["N2","K","J","N3","N2","N8","N10","N4","N4","N8","N8","J","N4","N9","N6","J","N7","Q","N8","N2","N5","N2","N3","N3","N10","N6","A","Q","A","Q","N10","N6","A","N9","K","K","J","N3","N7","N5","N5","N6","N7","K","N4","N7","N9","Q","N10","N5","A","N9"]	 できてる


-- デッキから奇数番のカードを集める
-- const getOddSuit = R.addIndex(R.filter)((_, i) => i % 2 !== 0);
-- 「奇数番」をどうやったら調べることができるか？
-- R.addIndexはその手がかりのため、インデックス番号を付すユーティリティだが、これらをどうやってプログラミングするのか
-- インデックス番号の付番はzip でできそう
-- ghci> zip [1..] "abc"
-- [(1,'a'),(2,'b'),(3,'c')] -- これでインデックス番号がついた
-- 次に奇数のフィルターだ
-- ghci> filter (\(key,v) -> odd key ) $ zip [1..] "abc"
-- [(1,'a'),(3,'c')]
-- 最後にインデックス番号を消す
-- ghci> map snd $ filter (\(key,v) -> odd key ) $ zip [1..] "abc"
-- "ac"

getOddSuit :: [Card] -> [Card]
getOddSuit xs = map snd $ filter (\(k,_) -> odd k) $ zip [1..] xs
-- ghci> getOddSuit [1,5,3,1,3,53,13] -- これは型宣言をつけなかった時の動作
-- [1,3,3,13]

getEvenSuit :: [Card] -> [Card]
getEvenSuit xs = map snd $ filter (\(k,_) -> even k) $ zip [1..] xs

-- デッキのカードをシャッフルし、２つに分けてPlayer用、ディーラー用とする
-- const prepareGame = R.pipe(
-- 	shuffleSuit(Math.random),
-- 	R.juxt([ getOddSuit, getEvenSuit ]), // https://ramdajs.com/docs/#juxt を使用し、偶数・奇数のカードを'Player'/'Dealer'に振り分ける (Card[],Card[])
-- 	R.zipObj([ 'Player', 'Dealer' ]),	// 左右に分けたデッキに名前をつける { 'Player': Card[], 'Dealer': Card[] }
-- );
-- PlayerとDealerをリストに格納しているが、その必要はあるか？→リスト処理の関数で処理できるから
-- →最後にリストにすればよく、途中はぐちゃっと書いてもいいはずだ
-- →処理を分けて一つづつ解決しよう
-- 1. デッキはシャッフル ... すでに済み(shuffleSuit)
-- 2. 偶数奇数でわけてそれぞれPlayer, Dealerに分ける
-- ソースがdeckなら動くんだが、
-- prepareGame' = [("Player",playerCards),("Dealer",dealerCards)] where
--                  playerCards = getOddSuit deck
--                  dealerCards = getEvenSuit deck
-- 
-- ghci> prepareGame'
-- [("Player",["A","N3","N5","N7","N9","J","K","N2","N4","N6","N8","N10","Q","A","N3","N5","N7","N9","J","K","N2","N4","N6","N8","N10","Q"]),("Dealer",["N2","N4","N6","N8","N10","Q","A","N3","N5","N7","N9","J","K","N2","N4","N6","N8","N10","Q","A","N3","N5","N7","N9","J","K"])]
-- ソースをshuffleSuit にするとコンパイル時エラー
-- prepareGame = [("Player",playerCards),("Dealer",dealerCards)] where
--                  playerCards = getOddSuit shuffleSuit
--                  dealerCards = getEvenSuit shuffleSuit
-- 
-- bj.hs:207:43: error:
--     • No instance for (Control.Monad.IO.Class.MonadIO [])
--         arising from a use of ‘shuffleSuit’
--     • In the first argument of ‘getOddSuit’, namely ‘shuffleSuit’
--       In the expression: getOddSuit shuffleSuit
--       In an equation for ‘playerCards’:
--           playerCards = getOddSuit shuffleSuit
-- このエラーは、これでも同じエラーが出るから、ここから調査しよう
-- ghci> getOddSuit shuffleSuit
-- 
-- この型の違いが原因だよなー
-- ghci> :t shuffleSuit
-- shuffleSuit :: Control.Monad.IO.Class.MonadIO m => m [Card]
-- ghci> :t getOddSuit
-- getOddSuit :: [b] -> [b]

-- 通常の関数 getOddSuit を、モナドをとって演算するにはどうしたらよかったんだっけ？
-- それはアプリカティブのfmap だ https://guvalif.github.io/functional-blackjack-v2/10
-- 
-- ghci> fmap getOddSuit shuffleSuit
-- ["Q","A","N10","K","K","J","N3","N4","N7","N7","N2","A","N4","N6","N10","N8","N5","N10","N6","N3","N6","Q","J","N7","N3","K"]
-- わあすげえ！できたよ！マジかよ（気づかないと延々とハマっていたな...）

-- これ、そのままだと型が曖昧だとエラーになる
-- playerCards = fmap getOddSuit shuffleSuit
-- 
-- 型宣言をつければコンパイルできた（難しいな）
-- playerCards :: Control.Monad.IO.Class.MonadIO m => m [Card]
-- playerCards = fmap getOddSuit shuffleSuit

-- これはコンパイルエラーにはならないが、
prepareGame' :: Control.Monad.IO.Class.MonadIO m => (String,m [Card])
prepareGame' = ("Player",playerCards) where
                            playerCards = fmap getOddSuit shuffleSuit

-- 評価するとエラーになる、しんどい
-- ghci> prepareGame'
-- <interactive>:108:1: error:
--     • Ambiguous type variable ‘m0’ arising from a use of ‘print’

-- ghci> :t prepareGame'
-- prepareGame'
--   :: Control.Monad.IO.Class.MonadIO m => (String, m [Card])








