-- Map: https://qiita.com/RunEagler/items/33f8b4abfd535c66a0d5
import qualified Data.Map.Strict as M

cards :: Num a => [(String,[a])]
cards = [("A", [1,11]),
         ("N2", [2]),
         ("N3", [3]),
         ("N4", [4]),
         ("N5", [5]),
         ("N6", [6]),
         ("N7", [7]),
         ("N8", [8]),
         ("N10", [10]),
         ("J", [10]),
         ("Q", [10]),
         ("K", [10])]

-- cards はただのリスト。これからMap型を生成するにはM.fromList を使用する
heart_suit :: [String]
heart_suit = M.keys (M.fromList cards) -- ["A","J","K","N10","N2","N3","N4","N5","N6","N7","N8","Q"]
diamond_suit = heart_suit
suit :: [String]
suit = concat [heart_suit,diamond_suit] -- concat でflatten している See: https://stackoverflow.com/questions/22459300/how-to-flatten-a-list-of-lists-of-lists-in-haskell

toPoint :: Num a => String -> Maybe [a]
-- toPoint k = M.lookup k (M.fromList cards)
toPoint k = M.lookup k (M.fromList cards)
