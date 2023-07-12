const R = require('ramda');
const Maybe = require('folktale/maybe');
const Result = require('folktale/result');
const { question } = require('readline-sync');

// Constants / Functions Definition
// ============================================================================
const CARDS = {
	'A'  : [1, 11],
	'N2' : [2],
	'N3' : [3],
	'N4' : [4],
	'N5' : [5],
	'N6' : [6],
	'N7' : [7],
	'N8' : [8],
	'N9' : [9],
	'N10': [10],
	'J'  : [10],
	'Q'  : [10],
	'K'  : [10]
};

const SPADE_SUIT   = R.keys(CARDS);
// console.log(SPADE_SUIT) // [ 'A', 'N2', 'N3', 'N4',  'N5', 'N6', 'N7',  'N8', 'N9', 'N10', 'J',  'Q', 'K' ]

const HEART_SUIT   = R.keys(CARDS);
const DIAMOND_SUIT = R.keys(CARDS);
const CLUB_SUIT    = R.keys(CARDS);
const SUIT         = [ ...SPADE_SUIT, ...HEART_SUIT, ...DIAMOND_SUIT, ...CLUB_SUIT ];

// console.log(SUIT) // [ 'A',   'N2',  'N3',  'N4', 'N5', 'N6', 'N7', 'N8',  'N9',  'N10', 'J',  'Q',  'K',  'A', 'N2',  'N3',  'N4',  'N5', 'N6', 'N7', 'N8', 'N9',  'N10', 'J',   'Q',  'K',  'A',  'N2', 'N3',  'N4',  'N5',  'N6', 'N7', 'N8', 'N9', 'N10', 'J',   'Q',   'K',  'A',  'N2', 'N3', 'N4',  'N5',  'N6',  'N7', 'N8', 'N9', 'N10', 'J',   'Q',   'K' ]


// == toPoint :: string -> [number]
const toPoint = R.prop(R.__, CARDS); // toPoint はカリー化した一引数関数
// console.log(toPoint("A")) // [1,11]

// == suitToPoints :: [string] -> [[number]]
const suitToPoints = R.map(toPoint);
// console.log(suitToPoints(['A','N2']))	// [[1,11],[2]]

// == addA2 :: [number] -> [number] -> [number]
const addA2 = R.lift(R.add);
// lift は引数を?引き上げる?
// console.log( R.add(1,2) ) // 3
// console.log( R.lift(R.add)([1,2],[3,4]) )	// [4,5,5,6]

// == getScores :: [[number]] -> [number]
const getScores = R.reduce(addA2, [0]);	// おそらくflatten

// 2.5 有効なスコアの抽出
// == getValidScore :: [number] -> Maybe<number>
const getValidScore = R.pipe(
	R.filter(R.gte(21)),
	R.ifElse(
		R.isEmpty,
		R.always(Maybe.Nothing()),
		R.o(Maybe.Just, R.reduce(R.max, 0))
	)
);

// R.pipe は R.filter のあとに R.ifElse を実行する
// https://ramdajs.com/docs/#pipe
// ```
// const f = R.pipe(Math.pow, R.negate, R.inc);
// f(10,3)
// ```
// 引数の数は最初のMath.pow に合わせる。Math.powの返り値は１引数になり、それは後続の関数のR.nigate につながる
// 
// R.always
// https://ramdajs.com/docs/#always
// 与えた値をそのまま返り値とする -> 値をそのまま置くのと何が違うのか？
// おそらくgetValidScore の引数を処理するための仕組みだろう
// この世界では何でも関数で表現しないといけないのかな?
// https://qiita.com/Guvalif/items/a4fe01a4c069836db4d8
// R.always は、いかなる値を受け取っても固定の値を返す関数 _ => CONST を、作るための高階関数です。
// R.o は、2つの関数用の R.compose です。Maybe.Just R.reduce(R.max, 0) とすることで、有効なスコアの最大値を Maybe.Just に包んで返すことができます。
// R.reduce(R.max,0)([1,2,3,2,1])	// 3
// R.reduce(R.max,10)([1,2,3,2,1])	// 10
// R.o(Maybe.Just,R.reduce(R.max,0))([1,3,10,5]) // Maybe.Just(10)

// 2.6 スートのシャッフル
// ↓これは手続き式. パラダイムをハイブリッドできるのはいいね
// == getShuffledSuit :: [string] -> [string] !impure
const getShuffledSuit = (suit) =>
{
	let shuffled_suit = R.clone(suit);
	for (let i = suit.length - 1; i > 0; i--)
	{
		const j = Math.floor(Math.random() * (i + 1));
		[ shuffled_suit[i], shuffled_suit[j] ] = [ shuffled_suit[j], shuffled_suit[i] ];
	}
	return shuffled_suit;
}

// == getEvenSuit :: [string] -> [string]
const getEvenSuit = R.addIndex(R.filter)((_, i) => i % 2 === 0);
// == getOddSuit :: [string] -> [string]
const getOddSuit = R.addIndex(R.filter)((_, i) => i % 2 !== 0);

// R.addIndexに何を渡せば動くのかがわからない
// あとのソースにはこうあったgetEvenSuit(SHUFFLED_SUIT);
// const SHUFFLED_SUIT = getShuffledSuit(SUIT);
// console.log(SHUFFLED_SUIT)				// [ 'J', 'N8', 'N10', 'N4', 'K',  'N10', 'N5', 'N6',  'N4', 'N10', 'Q',  'N2', 'N5',  'N3', 'N9',  'N6', 'N8',  'Q',  'N2', 'N8',  'N2', 'J', 'K',  'A', 'N3', 'N7', 'K', 'A', 'N6',  'K',  'N4',  'N4', 'N5', 'N7',  'N2', 'N9',  'N6', 'N9',  'A',  'Q',  'N3',  'N7', 'N10', 'N3', 'N5',  'A',  'Q',  'N7',  'N8', 'J', 'N9', 'J' ]
// console.log(getEvenSuit(SHUFFLED_SUIT)) //  ['J',  'N10', 'K',  'N5', 'N4', 'Q',  'N5',  'N9', 'N8', 'N2', 'N2', 'K',   'N3', 'K',  'N6', 'N4', 'N5',  'N2', 'N6', 'A', 'N3', 'N10', 'N5', 'Q',  'N8', 'N9' ]
// Evenのものを選び出すという意味はわかるが、どうして R.addIndex(R.filter)((_,i)=>i%2===0) と書いてそうなるかはわからない
// - R.addIndex() の中に R.filter がかけることをわからない
// - R.filter の引数がR.addIndex() の外に出ているのがわからない
// →スルーで
// R.addIndex とだけ入力すると生成される関数のソースが見れるのはよい（見てもわからなかったが...）
// https://i.gyazo.com/f750a5b00f63b4002b1bf457c3faadae.png



// 2.8 ゲーム続行の確認
// == continuePrompt :: () -> () !impure
const continuePrompt = () =>
{
	process.stdin.isTTY = process.stdout.isTTY = true;

	const input = question('Do you want to continue the game (Enter/Others) ? ');

	if (input === '') return;

	process.exit();
};

// 2.9 メインルーチンの実装

// Application Entry Point
// ============================================================================
const SHUFFLED_SUIT = getShuffledSuit(SUIT);
const PLAYER_SUIT   = getEvenSuit(SHUFFLED_SUIT);
const DEALER_SUIT   = getOddSuit(SHUFFLED_SUIT);

// == main :: number -> ()
const main = (hand) =>
{
	const scores = R.map(
		R.pipe(
			R.take(hand),
			suitToPoints,
			getScores,
			getValidScore
		),
		{ player: PLAYER_SUIT, dealer: DEALER_SUIT }
	);

	const results = R.map(
		m => m.fold(
			() => Result.Error('Bust!'),
			x  => (x === 21) ? Result.Error('Black Jack!') : Result.Ok(x)
		),
		scores
	);

	const situation = results.player.chain(R.always(results.dealer));

	const report     = R.map(m => m.merge(), results);
	const report_txt = `Player: ${report.player}, Dealer: ${report.dealer}`;

	console.log(report_txt);

	situation.fold(
		_ => process.exit(),
		_ => { continuePrompt(); main(hand + 1); }
	);
};

main(2);
