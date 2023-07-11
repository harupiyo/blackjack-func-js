const R = require('rambda');
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
const toPoint = R.prop(R.__, CARDS);

console.log(toPoint) // undefined ???

// == suitToPoints :: [string] -> [[number]]
const suitToPoints = R.map(toPoint);

console.log(suitToPoints('A'))
/*
// == addA2 :: [number] -> [number] -> [number]
const addA2 = R.lift(R.add);

// == getScores :: [[number]] -> [number]
const getScores = R.reduce(addA2, [0]);
*/
