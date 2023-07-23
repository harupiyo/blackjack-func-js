/*!
 * Copyright (C) 2023,
 * - Kazuyuki TAKASE (https://github.com/Guvalif)
 * - Chatwork Co., Ltd. (https://github.com/chatwork)
 *
 * This software is released under the MIT License.
 * See also: http://opensource.org/licenses/mit-license.php
 */
import assert from 'node:assert/strict';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import * as R from 'ramda';
import { Maybe } from 'purify-ts/Maybe';
import { Either, Left, Right } from 'purify-ts/Either'
import { EitherAsync } from 'purify-ts/EitherAsync';

/** @typedef {'A' | 'N2' | 'N3' | 'N4' | 'N5' | 'N6' | 'N7' | 'N8' | 'N9' | 'N10' | 'J' | 'Q' | 'K'} Card */
/** @type {Record<Card, number[]>} */
const POINT_TABLE = {
	'A'  : [ 1, 11 ],
	'N2' : [ 2 ],
	'N3' : [ 3 ],
	'N4' : [ 4 ],
	'N5' : [ 5 ],
	'N6' : [ 6 ],
	'N7' : [ 7 ],
	'N8' : [ 8 ],
	'N9' : [ 9 ],
	'N10': [ 10 ],
	'J'  : [ 10 ],
	'Q'  : [ 10 ],
	'K'  : [ 10 ],
};

/** @type {Card[]} */
const SUIT = R.flatten(R.repeat(R.keys(POINT_TABLE), 4));	// ブラックジャックではスートを使用しないので、単に1-13までのカードの４セットとしている

/** @type {(_: Card) => number[]} */
const toPoint = R.prop(R.__, POINT_TABLE);	// R.__はカリー化. toPoint は 'A' からそのカードの得点である [1,11] を得る

/** @type {(_: Card[]) => number[][]} */
const toPoints = R.map(toPoint);		// 手持ちのカードを点数に置き換える
										// console.log(toPoints(['A','N2']))	// [[1,11],[2]]

/** @type {(_: number[]) => (_: number[]) => number[]} */
const addA2 = R.lift(R.add);
// lift は引数を?引き上げる?
// console.log( R.add(1,2) ) // 3
// console.log( R.lift(R.add)([1,2],[3,4]) )	// [4,5,5,6]

/** @type {(_: number[][]) => number[]} */
const calcScores = R.reduce(addA2, [ 0 ]);	// ??? どうなる？

/** @type {(_: number[]) => Maybe<number>} */
const extractValidScore = R.pipe(
	R.filter(R.gte(21)),
	(xs) => Math.max(...xs),
	// https://gigobyte.github.io/purify/adts/Maybe#static-fromPredicate
	// Maybe.fromPredicate(x => x > 0, 5)	→ Just(5)
	// Maybe.fromPredicate(x => x > 0, -1)	→ Nothing
	Maybe.fromPredicate((x) => x !== - Infinity),
);

/** @type {(_: () => number) => (_: Card[]) => Card[]} */
const shuffleSuit = (random) => (suit) => {
	let shuffledSuit = R.clone(suit);

	for (let i = suit.length - 1; i > 0; i--) {
		const j = Math.floor(random() * (i + 1));

		[ shuffledSuit[i], shuffledSuit[j] ] = [ shuffledSuit[j], shuffledSuit[i] ];
	}

	return shuffledSuit;
};

/** @type {(_: Card[]) => Card[]} */
const getOddSuit = R.addIndex(R.filter)((_, i) => i % 2 !== 0);

/** @type {(_: Card[]) => Card[]} */
const getEvenSuit = R.addIndex(R.filter)((_, i) => i % 2 === 0);

/** @type {(_: Card[]) => Record<'Player' | 'Dealer', Card[]>} */
const prepareGame = R.pipe(
	shuffleSuit(Math.random),
	// https://ramdajs.com/docs/#juxt を使用し、偶数・奇数のカードを'Player'/'Dealer'に振り分ける
	R.juxt([ getOddSuit, getEvenSuit ]),
	R.zipObj([ 'Player', 'Dealer' ]),	// { 'Player': Card[], 'Dealer': Card[] }
);

/** @type {(_: number) => (_: Card[]) => Maybe<number>} */
const hit = (turn) => R.pipe(
	R.take(turn + 2),
	toPoints,
	calcScores,	// どういう動きをしているのか、console.log したいな
	extractValidScore,
);

/** @type {(_: Maybe<number>, _: string) => Either<string, string>} */
const judge = (scoreMaybe, name) => scoreMaybe.caseOf({
	Nothing : ()  => Left(`${name} Bust !`),
	Just    : (x) => (x === 21) ? Left(`${name} Blackjack !`) : Right(`${name}: ${x}`),
});

/**
 * @typedef { import('node:readline').ReadLineOptions } IO
 * @type {(_: IO) => EitherAsync<string, null>}
 */
const prompt = (io) => EitherAsync.fromPromise(async () => {
	const cli = createInterface(io);
	const result = await cli.question('Do you hit ? (Enter / Others) ');

	cli.close();

	return (result !== '') ? Left('See you !') : Right(null);
});

// Application Entry Point
// ============================================================================
const io = { input, output };
const game = prepareGame(SUIT);		// game = { 'Player': Card[], 'Dealer': Card[] }

/** @type {(_: number) => void} */
const main = (turn) => {
	assert.ok(turn >= 0);

	const score = R.map(hit(turn))(game);	// カードを２枚取り、スコアまで出す
		/*
		console.log(score)
		{
			Player: {
				__value: 12,	// スコアが出てる
				'fantasy-land/equals': [Function: equals],
				...以下fantasy-land関係のオブジェクト
			},
			Dealer: {
				__value: 16,
				'fantasy-land/equals': [Function: equals],
				...以下fantasy-land関係のオブジェクト
			}
		}
		*/

	const result = R.mapObjIndexed(judge)(score);
		/*
		console.log(result)
		{
			Player: {
				__value: 'Player: 9',	// この段階ではjudgeによって"Player Black Jack!" や"Player Bust!"などになりうる
				_: 'R',
				'fantasy-land/bimap': [Function: bimap],
				...以下fantasy-land関係のオブジェクト
			},
			Dealer: {
				__value: 'Dealer: 18',
				_: 'R',
				'fantasy-land/bimap': [Function: bimap],
				...以下fantasy-land関係のオブジェクト
			}
		}
		*/

	// https://gigobyte.github.io/purify/adts/Either#static-sequence
	// Either.sequence([Right(1), Right(2)])) → Right([1, 2])
	const showdown = Either.sequence(R.values(result));
		/*
		console.log(showdown)
		{
			__value: [ 'Player: 13', 'Dealer: 15' ],
			_: 'R',
			'fantasy-land/bimap': [Function: bimap],
			...以下fantasy-land関係のオブジェクト
		}
		*/

	// https://gigobyte.github.io/purify/adts/Either#instance-caseOf
	showdown.caseOf({
		Left  : ()   => {},		// "Player Bust!" や"Player Black Jack" なら終了
		Right : (xs) => console.log(`Turn ${turn} --`, xs.join(', ')),
	});

	// https://gigobyte.github.io/purify/adts/EitherAsync
	// liftEither はAsyncじゃない showdownをAsync っぽくあつかうらしい https://guvalif.github.io/functional-blackjack-v2/20 より
	EitherAsync.liftEither(showdown).chain(() => prompt(io)).caseOf({
		Left  : (x) => console.log(x),		// 'See you !'->プログラム終了
		Right : ()  => main(turn + 1),		// main を再帰呼出しでループ
	});
};

main(0);
