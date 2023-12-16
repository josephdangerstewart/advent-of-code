import fs from 'fs/promises';

type CellKind = '#' | '.';
type PuzzleInput = CellKind[][];
type CellCoordinates = [number, number];
type GalaxyPairing = [CellCoordinates, CellCoordinates];

const expansionRate = 1000000;

async function main() {
	const rawInput = await fs.readFile('./2023/day-11.txt', {
		encoding: 'utf-8',
	});
	const puzzleInput: PuzzleInput = rawInput
		.split(/\r?\n/)
		.map((row) => row.split('').map(validateCellKind));

	const emptyRows = getEmptyRowIndexes(puzzleInput);
	const emptyColumns = getEmptyColumnIndexes(puzzleInput);

	const result = getPairings(puzzleInput)
		.map((pair) => getDistanceOfPair(pair, emptyRows, emptyColumns))
		.reduce((run, cur) => run + cur);

	console.log('result', result);
}

main();

function getDistanceOfPair(
	pairing: GalaxyPairing,
	emptyRowIndexes: number[],
	emptyColumnIndexes: number[]
): number {
	const [[leftRow, leftCol], [rightRow, rightCol]] = pairing;

	const [minRow, maxRow] = [leftRow, rightRow].sort((a, b) => a - b);
	const [minCol, maxCol] = [leftCol, rightCol].sort((a, b) => a - b);

	const expandedRowsTraversed = emptyRowIndexes.filter(
		(index) => index > minRow && index < maxRow
	).length;
	const expandedColumnsTraversed = emptyColumnIndexes.filter(
		(index) => index > minCol && index < maxCol
	).length;

	return (
		maxRow - minRow +
		maxCol - minCol +
		expandedColumnsTraversed * (expansionRate - 1) +
		expandedRowsTraversed * (expansionRate - 1)
	);
}

function getPairings(input: PuzzleInput): GalaxyPairing[] {
	const galaxies = input
		.flatMap((row, rowIndex) =>
			row.map<CellCoordinates | undefined>((cell, columnIndex) =>
				cell === '.' ? undefined : [rowIndex, columnIndex]
			)
		)
		.filter((cell): cell is CellCoordinates => Boolean(cell));

	const pairings: GalaxyPairing[] = [];
	for (let i = 0; i < galaxies.length; i++) {
		for (let j = i + 1; j < galaxies.length; j++) {
			pairings.push([galaxies[i], galaxies[j]]);
		}
	}

	return pairings;
}

function getEmptyRowIndexes(input: PuzzleInput): number[] {
	const result: number[] = [];
	for (let rowIndex = 0; rowIndex < input.length; rowIndex++) {
		if (isRowEmpty(input, rowIndex)) {
			result.push(rowIndex);
		}
	}
	return result;
}

function getEmptyColumnIndexes(input: PuzzleInput): number[] {
	const result: number[] = [];
	for (let columnIndex = 0; columnIndex < input[0].length; columnIndex++) {
		if (isColumnEmpty(input, columnIndex)) {
			result.push(columnIndex);
		}
	}
	return result;
}

function isColumnEmpty(input: PuzzleInput, columnIndex: number) {
	for (let i = 0; i < input.length; i++) {
		if (input[i][columnIndex] !== '.') {
			return false;
		}
	}
	return true;
}

function isRowEmpty(input: PuzzleInput, rowIndex: number) {
	for (let i = 0; i < input[rowIndex].length; i++) {
		if (input[rowIndex][i] !== '.') {
			return false;
		}
	}
	return true;
}

function validateCellKind(input: string): CellKind {
	if (input !== '#' && input !== '.') {
		throw new Error(`invalid input ${input}`);
	}
	return input;
}
