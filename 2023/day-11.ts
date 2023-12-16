import fs from 'fs/promises';

type CellKind = '#' | '.';
type PuzzleInput = CellKind[][];
type CellCoordinates = [number, number];
type GalaxyPairing = [CellCoordinates, CellCoordinates];

async function main() {
	const rawInput = await fs.readFile('./2023/day-11.txt', {
		encoding: 'utf-8',
	});
	const puzzleInput: PuzzleInput = rawInput
		.split(/\r?\n/)
		.map((row) => row.split('').map(validateCellKind));

	expandSpace(puzzleInput);

	const result = getPairings(puzzleInput)
		.map(getDistanceOfPair)
		.reduce((run, cur) => run + cur);

	console.log('result', result);
}

main();

function getDistanceOfPair(pairing: GalaxyPairing): number {
	const [[leftRow, leftCol], [rightRow, rightCol]] = pairing;
	return Math.abs(rightRow - leftRow) + Math.abs(leftCol - rightCol);
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

function expandSpace(input: PuzzleInput) {
	let rowCount = input.length;
	let columnCount = input[0].length;

	for (let row = 0; row < rowCount; row++) {
		if (isRowEmpty(input, row)) {
			addEmptyRow(input, row);
			rowCount++;
			row++;
		}
	}

	for (let column = 0; column < columnCount; column++) {
		if (isColumnEmpty(input, column)) {
			addEmptyColumn(input, column);
			columnCount++;
			column++;
		}
	}
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

function addEmptyRow(input: PuzzleInput, rowIndex: number) {
	const rowLength = input[0].length;
	const newRow: CellKind[] = Array.from(Array(rowLength)).map(() => '.');
	input.splice(rowIndex, 0, newRow);
}

function addEmptyColumn(input: PuzzleInput, columnIndex: number) {
	for (let i = 0; i < input.length; i++) {
		input[i].splice(columnIndex, 0, '.');
	}
}

function validateCellKind(input: string): CellKind {
	if (input !== '#' && input !== '.') {
		throw new Error(`invalid input ${input}`);
	}
	return input;
}
