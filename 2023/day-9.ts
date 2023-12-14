import fs from 'fs/promises';

async function main() {
	const rawInput = await fs.readFile('./2023/day-9.txt', {
		encoding: 'utf-8',
	});

	const parsedInput = rawInput
		.split('\n')
		.map((line) => line.split(' ').map((value) => parseInt(value)));

	const result = parsedInput
		.map(calculateNextNumberInSequence)
		.reduce((run, cur) => run + cur);

	console.log(result);
}

main();

function calculateNextNumberInSequence(sequence: number[]): number {
	if (sequence.every((n) => n === 0)) {
		return 0;
	}

	const diffs = sequence.reduce<number[]>((run, cur, index, all) => {
		if (index === 0) {
			return run;
		}

		run.push(cur - all[index - 1]);

		return run;
	}, []);

	return sequence[sequence.length - 1] + calculateNextNumberInSequence(diffs);
}
