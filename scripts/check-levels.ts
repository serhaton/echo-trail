/**
 * Level sanity check: for every level and difficulty, verify that the
 * target and every collectible can be reached from the start by a player
 * of the real collision radius (grid BFS over walkable cells).
 *
 * Usage: npm run check-levels
 */
import { allLevels, obstaclesFor } from '../src/data/levels';
import { penetration } from '../src/game/collision';
import { DIFFICULTIES } from '../src/game/difficulty';
import { WORLD_HEIGHT, WORLD_WIDTH, type Vec2 } from '../src/game/geometry';

const PLAYER_RADIUS = 9;
const STEP = 5;
const COLS = Math.floor(WORLD_WIDTH / STEP);
const ROWS = Math.floor(WORLD_HEIGHT / STEP);

let failures = 0;
for (const level of allLevels()) {
  for (const difficulty of DIFFICULTIES) {
    const obstacles = obstaclesFor(level, difficulty);
    const free = (x: number, y: number) =>
      x >= PLAYER_RADIUS &&
      y >= PLAYER_RADIUS &&
      x <= WORLD_WIDTH - PLAYER_RADIUS &&
      y <= WORLD_HEIGHT - PLAYER_RADIUS &&
      obstacles.every((o) => !penetration({ x, y }, PLAYER_RADIUS, o));
    const cell = (p: Vec2) => [Math.round(p.x / STEP), Math.round(p.y / STEP)] as const;
    const seen = new Uint8Array(COLS * ROWS + COLS);
    const [sx, sy] = cell(level.start);
    if (!free(level.start.x, level.start.y)) {
      console.log(`✗ ${level.id} [${difficulty}] start is inside an obstacle`);
      failures++;
      continue;
    }
    const queue: [number, number][] = [[sx, sy]];
    seen[sy * COLS + sx] = 1;
    while (queue.length) {
      const [cx, cy] = queue.pop()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx < 0 || ny < 0 || nx > COLS || ny > ROWS || seen[ny * COLS + nx]) continue;
        if (!free(nx * STEP, ny * STEP)) continue;
        seen[ny * COLS + nx] = 1;
        queue.push([nx, ny]);
      }
    }
    // A point counts as reachable if any walkable visited cell is within its pickup radius.
    const reachable = (p: Vec2, radius: number) => {
      for (let y = 0; y <= ROWS; y++)
        for (let x = 0; x <= COLS; x++)
          if (seen[y * COLS + x] && Math.hypot(x * STEP - p.x, y * STEP - p.y) < radius) return true;
      return false;
    };
    const problems: string[] = [];
    if (!reachable(level.target.position, level.target.reachRadius ?? 26)) problems.push('target');
    for (const c of level.collectibles ?? []) if (!reachable(c.position, 22)) problems.push(c.id);
    if (problems.length) {
      failures++;
      console.log(`✗ ${level.id} [${difficulty}] unreachable: ${problems.join(', ')}`);
    } else {
      console.log(`✓ ${level.id} [${difficulty}]`);
    }
  }
}
process.exit(failures ? 1 : 0);
