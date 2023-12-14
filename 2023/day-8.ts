import fs from 'fs/promises';

interface Node {
	left: string;
	right: string;
}

async function main(): Promise<void> {
	const fileContents = (
		await fs.readFile('./2023/day-8.txt', { encoding: 'utf-8' })
	).split('\n');

	const directions = fileContents[0].split('');

	const map = fileContents
		.slice(2)
		.reduce<Record<string, Node>>((result, line) => {
			if (!line) {
				return result;
			}

			const [, key, left, right] =
				/([A-Z]{3}) = \(([A-Z]{3}), ([A-Z]{3})\)/.exec(line) ?? [];

			if (result[key]) {
				throw new Error(`Key ${key} already has been processed`);
			}

			result[key] = {
				left,
				right,
			};

			return result;
		}, {});

	let currentKey = 'AAA';
	if (!map[currentKey]) {
		throw new Error('Could not find start node');
	}

	let index = 0;
	let steps = 0;

	while (currentKey !== 'ZZZ') {
		steps++;
		const node = map[currentKey];

		const direction = directions[index];
		currentKey = node[direction === 'L' ? 'left' : 'right'];

		if (index === directions.length - 1) {
			index = 0;
		} else {
			index++;
		}
	}

	console.log('steps: ', steps);
}

main();
