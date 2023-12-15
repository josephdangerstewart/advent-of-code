import fs from 'fs/promises';

/**
| is a vertical pipe connecting north and south.
- is a horizontal pipe connecting east and west.
L is a 90-degree bend connecting north and east.
J is a 90-degree bend connecting north and west.
7 is a 90-degree bend connecting south and west.
F is a 90-degree bend connecting south and east.
. is ground; there is no pipe in this tile.
 */

const pipeConnections = {
	'|': [
		['north', 'north'],
		['south', 'south'],
	],
	'-': [
		['east', 'east'],
		['west', 'west'],
	],
	L: [
		['south', 'east'],
		['west', 'north'],
	],
	J: [
		['south', 'west'],
		['east', 'north'],
	],
	'7': [
		['north', 'west'],
		['east', 'south'],
	],
	F: [
		['north', 'east'],
		['west', 'south'],
	],
	'.': [[]],
	S: [[]],
} as const;

type PipeKind = keyof typeof pipeConnections;
type Direction = (typeof pipeConnections)[PipeKind][number][number];
type Coordinates = [y: number, x: number];

function isPipeKind(kind: any): kind is PipeKind {
	return Object.keys(pipeConnections).includes(kind);
}

const directionTransforms: Record<
	Direction,
	(position: Coordinates) => Coordinates
> = {
	north: ([y, x]) => [y - 1, x],
	south: ([y, x]) => [y + 1, x],
	east: ([y, x]) => [y, x + 1],
	west: ([y, x]) => [y, x - 1],
};

interface Pipe {
	coordinates: Coordinates;
	kind: PipeKind;
}

async function main() {
	const rawInput = await fs.readFile('./2023/day-10.txt', {
		encoding: 'utf-8',
	});

	let startingNode: Pipe | undefined;
	const grid = rawInput.split('\n').map((line, y) =>
		line.split('').map<Pipe>((kind, x) => {
			if (!isPipeKind(kind)) {
				throw new Error(`Invalid kind: "${kind}"`);
			}

			const pipe: Pipe = {
				coordinates: [y, x],
				kind,
			};

			if (kind === 'S') {
				if (startingNode) {
					throw new Error('input contains multiple starting nodes');
				}
				startingNode = pipe;
			}

			return pipe;
		})
	);

	if (!startingNode) {
		throw new Error('startingNode is not defined');
	}

	for (const startingDirection of ['north', 'south', 'east', 'west'] as const) {
		console.log('new loop');
		const [isLoop, steps] = tryGetLoop(grid, startingNode, startingDirection);

		if (isLoop) {
			console.log(steps / 2);
			break;
		}
	}
}

main();

function tryGetLoop(
	allNodes: Pipe[][],
	startingNode: Pipe,
	startingDirection: Direction
): [isLoop: boolean, steps: number] {
	let [nextNode, nextDirection] = followNode(
		allNodes,
		startingNode,
		startingDirection
	);

	let steps = 1;
	while (nextNode && nextDirection && nextNode.kind !== 'S') {
		steps++;
		[nextNode, nextDirection] = followNode(allNodes, nextNode, nextDirection);
	}

	if (nextNode && nextNode.kind === 'S') {
		return [true, steps];
	}

	return [false, 0];
}

function followNode(
	allNodes: Pipe[][],
	node: Pipe,
	direction: Direction
): [Pipe | undefined, Direction | undefined] {
	const [nextY, nextX] = directionTransforms[direction](node.coordinates);
	const candidate = allNodes[nextY][nextX];

	// Can candidate connect to node?
	const candidateConnection =
		pipeConnections[candidate.kind].find((flow) => flow[0] === direction) ?? [];

	const nextDirection = candidateConnection[1];
	return [candidate, nextDirection];
}
