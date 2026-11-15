/**
 * Level generator.
 *
 * Writes the procedurally designed levels of each journey:
 *   zen 11–30, mystery 11–30 (1–10 are hand-made), tension 1–30, cheerful 1–30
 * and rewrites src/data/levels/index.ts to import everything.
 *
 * Every layout is built from an archetype (maze of rooms, zigzag bars,
 * corridors, scattered obstacles, a ring around the target, pools) with a
 * fixed seed, then tested with the game's own pathfinding. A layout is only
 * kept if, with every obstacle present (Hard):
 *   - the target is reachable, by a route that is neither trivial nor endless;
 *   - the target cannot be reached in a straight line from the start;
 *   - every collectible sits on a reachable spot.
 * Countdown lengths come from the real route length.
 *
 * Deterministic: running it again produces the same files. Generated files
 * may be edited by hand afterwards, but running the generator overwrites
 * them, so change the generator (or move the level out of its range) instead.
 *
 * Usage: npm run generate-levels
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { penetration } from '../src/game/collision';
import { WORLD_HEIGHT, WORLD_WIDTH, type Shape, type Vec2 } from '../src/game/geometry';
import { NavGrid, NAV_STEP } from '../src/game/pathfinding';

const W = WORLD_WIDTH;
const H = WORLD_HEIGHT;
const PLAYER_RADIUS = 9;
const PLAYER_SPEED = 110;
const ROOT = join(__dirname, '..', 'src', 'data', 'levels');

type Mode = 'zen' | 'mystery' | 'tension' | 'cheerful';
type Material = 'wall' | 'tree' | 'rock' | 'water' | 'furniture';
type Tier = 'normal' | 'hard';
type Obs = Shape & { material: Material; fromDifficulty?: Tier };
type Archetype = 'scatter' | 'bars' | 'columns' | 'maze' | 'ring' | 'pools' | 'barsScatter';

interface Layout {
  start: Vec2;
  target: Vec2;
  obstacles: Obs[];
  note: string;
}

// ------------------------------------------------------------------ utilities

/** Small deterministic PRNG (mulberry32). */
function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (lo: number, hi: number) => lo + next() * (hi - lo),
    int: (lo: number, hi: number) => Math.floor(lo + next() * (hi - lo + 1)),
    pick: <T>(list: readonly T[]) => list[Math.floor(next() * list.length)]!,
    chance: (p: number) => next() < p,
  };
}
type Rng = ReturnType<typeof rng>;

const round = (v: number) => Math.round(v);
const rect = (x: number, y: number, w: number, h: number, material: Material): Obs => ({
  kind: 'rect',
  x: round(x),
  y: round(y),
  w: round(w),
  h: round(h),
  material,
});
const circle = (x: number, y: number, r: number, material: Material): Obs => ({
  kind: 'circle',
  x: round(x),
  y: round(y),
  r: round(r),
  material,
});

/** Is a circle of radius r at p clear of every obstacle (with extra margin)? */
function clear(p: Vec2, r: number, obstacles: readonly Obs[]): boolean {
  if (p.x < r || p.y < r || p.x > W - r || p.y > H - r) return false;
  return obstacles.every((o) => !penetration(p, r, o));
}

/** Drop `count` circles at random, keeping gaps a player can walk through. */
function scatterCircles(
  r: Rng,
  obstacles: Obs[],
  count: number,
  radius: [number, number],
  materials: readonly Material[],
  keepOut: readonly Vec2[],
  area: { y0: number; y1: number } = { y0: 140, y1: 790 },
) {
  let placed = 0;
  for (let attempt = 0; attempt < count * 40 && placed < count; attempt++) {
    const rad = r.range(radius[0], radius[1]);
    const p = { x: r.range(rad + 4, W - rad - 4), y: r.range(area.y0, area.y1) };
    if (keepOut.some((k) => Math.hypot(k.x - p.x, k.y - p.y) < rad + 46)) continue;
    // Clear with room for the player to pass between this and its neighbours.
    if (!clear(p, rad + 2 * PLAYER_RADIUS + 8, obstacles)) continue;
    obstacles.push(circle(p.x, p.y, rad, r.pick(materials)));
    placed++;
  }
}

// ------------------------------------------------------------------ archetypes

interface Palette {
  /** Long barriers (walls, logs, hedges, water channels). */
  barrier: readonly Material[];
  /** Round things (trees, rocks, furniture). */
  blob: readonly Material[];
  pool: Material;
}

const PALETTES: Record<Mode, Palette> = {
  zen: { barrier: ['tree', 'water'], blob: ['tree', 'tree', 'rock'], pool: 'water' },
  mystery: { barrier: ['wall', 'furniture'], blob: ['furniture'], pool: 'furniture' },
  tension: { barrier: ['wall', 'rock'], blob: ['rock', 'tree'], pool: 'rock' },
  cheerful: { barrier: ['tree', 'water'], blob: ['tree', 'rock'], pool: 'water' },
};

function topBottom(r: Rng): { start: Vec2; target: Vec2 } {
  return { start: { x: round(r.range(50, W - 50)), y: 850 }, target: { x: round(r.range(50, W - 50)), y: 90 } };
}

function scatter(r: Rng, d: number, pal: Palette): Layout {
  const { start, target } = topBottom(r);
  const obstacles: Obs[] = [];
  const n = round(7 + d * 9);
  scatterCircles(r, obstacles, n, [20, 36], pal.blob, [start, target]);
  return { start, target, obstacles, note: `scatter of ${obstacles.length}` };
}

function pools(r: Rng, d: number, pal: Palette): Layout {
  const { start, target } = topBottom(r);
  const obstacles: Obs[] = [];
  scatterCircles(r, obstacles, round(6 + d * 5), [32, 50], [pal.pool], [start, target]);
  scatterCircles(r, obstacles, round(2 + d * 3), [16, 24], pal.blob, [start, target]);
  return { start, target, obstacles, note: `${obstacles.length} pools and stones` };
}

/** Horizontal barriers, each with one gap; gaps alternate sides so the path zigzags. */
function bars(r: Rng, d: number, pal: Palette, withScatter = false): Layout {
  const k = round(2 + d * 3);
  const material = r.pick(pal.barrier);
  const thick = material === 'water' ? r.range(36, 50) : r.range(18, 26);
  const obstacles: Obs[] = [];
  let side = r.chance(0.5) ? 0 : 1;
  for (let i = 0; i < k; i++) {
    const y = 210 + ((700 - 210) * (i + 0.5)) / k + r.range(-18, 18);
    const gap = r.range(78, 110);
    // Mostly at an edge (alternating), sometimes somewhere in the middle.
    const gx = r.chance(0.25) ? r.range(110, W - 110 - gap) : side === 0 ? r.range(0, 40) : W - gap - r.range(0, 40);
    side = 1 - side;
    if (gx > 14) obstacles.push(rect(0, y, gx, thick, material));
    if (W - (gx + gap) > 14) obstacles.push(rect(gx + gap, y, W - gx - gap, thick, material));
  }
  const { start, target } = topBottom(r);
  if (withScatter) scatterCircles(r, obstacles, round(2 + d * 4), [16, 24], pal.blob, [start, target]);
  return { start, target, obstacles, note: `${k} barriers${withScatter ? ' with scatter' : ''}` };
}

/** Vertical barriers making corridors; gaps alternate top / bottom. */
function columns(r: Rng, d: number, pal: Palette): Layout {
  const k = round(2 + d * 1.2); // 3–4 corridors: more makes the walk too long
  const material = r.pick(pal.barrier.filter((m) => m !== 'water'));
  const thick = r.range(18, 24);
  const obstacles: Obs[] = [];
  const lane = W / (k + 1);
  let gapAtTop = true;
  for (let i = 1; i <= k; i++) {
    const x = lane * i - thick / 2 + r.range(-10, 10);
    const gap = r.range(90, 120);
    if (gapAtTop) obstacles.push(rect(x, gap, thick, H - gap, material));
    else obstacles.push(rect(x, 0, thick, H - gap, material));
    gapAtTop = !gapAtTop;
  }
  // Start at the bottom of the first lane; the target at the far end of the last.
  const start = { x: round(lane / 2), y: 850 };
  const target = { x: round(W - lane / 2), y: gapAtTop ? 90 : 810 };
  if (r.chance(0.5)) {
    start.x = W - start.x;
    target.x = W - target.x;
    for (const o of obstacles) if (o.kind === 'rect') o.x = round(W - o.x - o.w);
  }
  scatterCircles(r, obstacles, round(d * 4), [14, 20], pal.blob, [start, target]);
  return { start, target, obstacles, note: `${k + 1} corridors` };
}

/** Rooms with doors: a perfect maze on a small grid, plus a few extra doors. */
function maze(r: Rng, d: number, pal: Palette, big: boolean): Layout {
  const cols = big && d > 0.35 ? 3 : 2;
  const rows = round((big ? 3 : 3) + d * (big ? 3 : 1.4));
  const cw = W / cols;
  const ch = H / rows;
  const material = pal.barrier.filter((m) => m !== 'water')[0]!;
  const thick = 18;
  const id = (c: number, row: number) => row * cols + c;
  // Randomised depth-first search → which neighbouring cells are connected.
  const open = new Set<string>();
  const seen = new Set<number>([id(r.int(0, cols - 1), rows - 1)]);
  const stack = [...seen];
  const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);
  while (stack.length) {
    const cur = stack[stack.length - 1]!;
    const c = cur % cols;
    const row = (cur - c) / cols;
    const options = [
      [c + 1, row],
      [c - 1, row],
      [c, row + 1],
      [c, row - 1],
    ].filter(([nc, nr]) => nc! >= 0 && nr! >= 0 && nc! < cols && nr! < rows && !seen.has(id(nc!, nr!)));
    if (!options.length) {
      stack.pop();
      continue;
    }
    const [nc, nr] = r.pick(options) as [number, number];
    open.add(key(cur, id(nc, nr)));
    seen.add(id(nc, nr));
    stack.push(id(nc, nr));
  }
  const obstacles: Obs[] = [];
  const edge = (a: number, b: number, x: number, y: number, w: number, h: number) => {
    const connected = open.has(key(a, b)) || r.chance(0.12); // a few loops
    if (!connected) {
      obstacles.push(rect(x, y, w, h, material));
      return;
    }
    if (r.chance(0.3)) return; // fully open
    // A doorway: wall with a gap.
    const horizontal = w > h;
    const len = horizontal ? w : h;
    const gap = r.range(66, 90);
    const at = r.range(14, len - gap - 14);
    if (horizontal) {
      obstacles.push(rect(x, y, at, h, material), rect(x + at + gap, y, len - at - gap, h, material));
    } else {
      obstacles.push(rect(x, y, w, at, material), rect(x, y + at + gap, w, len - at - gap, material));
    }
  };
  for (let row = 0; row < rows; row++) {
    for (let c = 0; c < cols; c++) {
      if (c + 1 < cols) edge(id(c, row), id(c + 1, row), (c + 1) * cw - thick / 2, row * ch, thick, ch);
      if (row + 1 < rows) edge(id(c, row), id(c, row + 1), c * cw, (row + 1) * ch - thick / 2, cw, thick);
    }
  }
  const centre = (c: number, row: number) => ({ x: round((c + 0.5) * cw), y: round((row + 0.5) * ch) });
  const start = centre(r.int(0, cols - 1), rows - 1);
  const target = centre(r.int(0, cols - 1), 0);
  scatterCircles(r, obstacles, round(d * 5), [13, 18], pal.blob, [start, target], { y0: 60, y1: 840 });
  return { start, target, obstacles, note: `maze of ${cols}×${rows} rooms` };
}

/** The target sits inside a ring of obstacles with one opening. */
function ring(r: Rng, d: number, pal: Palette): Layout {
  const target = { x: round(r.range(160, W - 160)), y: round(r.range(300, 440)) };
  const start = { x: round(r.range(50, W - 50)), y: 850 };
  const obstacles: Obs[] = [];
  const R = r.range(112, 128);
  const rad = 26;
  const material = r.pick(pal.blob);
  const count = Math.ceil((2 * Math.PI * R) / (2 * rad + 6));
  // Opening somewhere on the far side, so you have to walk round.
  const openAt = r.range(Math.PI * 1.15, Math.PI * 1.85);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * 2 * Math.PI;
    const diff = Math.abs(((a - openAt + Math.PI * 3) % (2 * Math.PI)) - Math.PI);
    if (diff < (1.6 * 2 * Math.PI) / count) continue;
    const p = { x: target.x + Math.cos(a) * R, y: target.y + Math.sin(a) * R };
    if (p.x > rad && p.x < W - rad) obstacles.push(circle(p.x, p.y, rad, material));
  }
  scatterCircles(r, obstacles, round(3 + d * 6), [18, 28], pal.blob, [start, target], { y0: 560, y1: 780 });
  return { start, target, obstacles, note: 'ring around the target' };
}

function build(type: Archetype, r: Rng, d: number, mode: Mode): Layout {
  const pal = PALETTES[mode];
  switch (type) {
    case 'scatter':
      return scatter(r, d, pal);
    case 'pools':
      return pools(r, d, pal);
    case 'bars':
      return bars(r, d, pal);
    case 'barsScatter':
      return bars(r, d, pal, true);
    case 'columns':
      return columns(r, d, pal);
    case 'ring':
      return ring(r, d, pal);
    case 'maze':
      return maze(r, d, pal, mode === 'mystery' || mode === 'tension');
  }
}

/** Which archetypes each world uses, in rotation (so neighbours differ). */
const ROTATION: Record<Mode, readonly Archetype[]> = {
  zen: ['scatter', 'bars', 'pools', 'ring', 'barsScatter', 'maze', 'scatter', 'columns'],
  mystery: ['maze', 'bars', 'maze', 'columns', 'barsScatter', 'maze', 'ring'],
  tension: ['scatter', 'maze', 'bars', 'columns', 'maze', 'ring', 'barsScatter', 'maze'],
  cheerful: ['scatter', 'pools', 'bars', 'ring', 'maze', 'barsScatter', 'columns', 'scatter'],
};

// ------------------------------------------------------------------ validation

interface Checked extends Layout {
  routeLength: number;
  spots: Vec2[];
}

function check(
  layout: Layout,
  index: number,
  r: Rng,
  wantSpots: number,
  minRoute: number,
): Checked | null {
  const { start, target, obstacles } = layout;
  if (!clear(start, PLAYER_RADIUS + 14, obstacles) || !clear(target, PLAYER_RADIUS + 16, obstacles)) return null;
  let nav = new NavGrid(obstacles, { width: W, height: H }, PLAYER_RADIUS);
  const cellValue = (field: Float32Array, p: Vec2) =>
    field[Math.round(p.y / NAV_STEP) * nav.cols + Math.round(p.x / NAV_STEP)] ?? Infinity;
  let field = nav.distanceField(target);
  if (cellValue(field, start) === Infinity) return null;
  if (index > 2 && nav.lineClear(start, target)) return null; // too easy: straight shot

  // Extra obstacles for Normal / Hard, only where they don't block the way.
  const pal = layout.obstacles.find((o) => o.kind === 'circle')?.material ?? layout.obstacles[0]?.material ?? 'rock';
  for (const tier of ['normal', 'hard', 'hard'] as const) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const rad = r.range(15, 22);
      const p = { x: r.range(40, W - 40), y: r.range(150, 760) };
      if (Math.hypot(p.x - start.x, p.y - start.y) < 80 || Math.hypot(p.x - target.x, p.y - target.y) < 80) continue;
      if (!clear(p, rad + 2 * PLAYER_RADIUS + 8, obstacles)) continue;
      const extra: Obs = { ...circle(p.x, p.y, rad, pal), fromDifficulty: tier };
      const trial = new NavGrid([...obstacles, extra], { width: W, height: H }, PLAYER_RADIUS);
      const trialField = trial.distanceField(target);
      if (cellValue(trialField, start) === Infinity) continue;
      obstacles.push(extra);
      nav = trial;
      field = trialField;
      break;
    }
  }

  const routeLength = cellValue(field, start);
  if (routeLength < minRoute || routeLength > 3400) return null;

  // Collectible spots: reachable, far from start, target and each other.
  const fromStart = nav.distanceField(start);
  const spots: Vec2[] = [];
  while (spots.length < wantSpots) {
    let best: Vec2 | null = null;
    let bestScore = 110; // minimum spacing
    for (let y = 40; y <= H - 40; y += NAV_STEP) {
      for (let x = 40; x <= W - 40; x += NAV_STEP) {
        const p = { x, y };
        if (cellValue(fromStart, p) === Infinity || !clear(p, PLAYER_RADIUS + 10, obstacles)) continue;
        const score = Math.min(...[start, target, ...spots].map((q) => Math.hypot(q.x - x, q.y - y)));
        if (score > bestScore) {
          bestScore = score;
          best = p;
        }
      }
    }
    if (!best) return null;
    spots.push(best);
  }
  return { ...layout, routeLength, spots };
}

// ------------------------------------------------------------------ level content

const STAR_GATES: Record<number, number> = { 3: 4, 5: 8, 7: 13, 9: 18, 12: 22, 15: 28, 18: 35, 21: 42, 24: 49, 27: 56, 30: 63 };

function sounds(mode: Mode, n: number): { target: string; ambience: string } {
  const stage = (n - 1) % 10;
  if (mode === 'zen') {
    if (stage <= 2) return { target: 'targetBird', ambience: 'ambForestDawn' };
    if (stage <= 4) return { target: 'targetWaterDrop', ambience: 'ambRiverNoon' };
    if (stage <= 7) return { target: 'targetWindChime', ambience: 'ambBeachEvening' };
    return { target: 'targetOwl', ambience: 'ambHillNight' };
  }
  if (mode === 'mystery') {
    const target = n % 10 === 0 ? 'targetClockChime' : n % 5 === 0 ? 'targetPiano' : n % 7 === 0 ? 'targetWaterDrop' : 'targetMusicBox';
    return { target, ambience: (['ambHouse', 'ambRain', 'ambCellar', 'ambRain'] as const)[n % 4]! };
  }
  if (mode === 'tension') return { target: 'targetBeacon', ambience: 'ambDread' };
  return { target: Math.floor((n - 1) / 5) % 2 === 0 ? 'targetXylophone' : 'targetBikeBell', ambience: 'ambFair' };
}

function collectibles(mode: Mode, n: number, id: string, spots: Vec2[]): string[] {
  const item = (tag: string, p: Vec2, reward: string) =>
    `    {\n      id: '${id}-${tag}',\n      position: { x: ${p.x}, y: ${p.y} },\n      sound: 'placeholderCollectible',\n      reward: ${reward},\n    },`;
  if (mode === 'cheerful') return spots.map((p, i) => item(`star-${i + 1}`, p, `{ kind: 'star', seconds: 5 }`));
  if (mode === 'tension') return [item('time', spots[0]!, `{ kind: 'time', seconds: 10 }`)];
  if (mode === 'mystery') {
    return [
      item('story', spots[0]!, `{ kind: 'story', storyId: 's${String(n).padStart(2, '0')}' }`),
      item('time', spots[1]!, `{ kind: 'time', seconds: 10 }`),
    ];
  }
  return [item('time', spots[0]!, `{ kind: 'time', seconds: 10 }`), item('album', spots[1]!, `{ kind: 'albumDetail' }`)];
}

const SPOTS: Record<Mode, number> = { zen: 2, mystery: 2, tension: 1, cheerful: 3 };
const SEED_BASE: Record<Mode, number> = { zen: 1000, mystery: 2000, tension: 3000, cheerful: 4000 };
const FIRST: Record<Mode, number> = { zen: 11, mystery: 11, tension: 1, cheerful: 1 };
const LAST = 30;

function fmtObstacle(o: Obs): string {
  const dims = o.kind === 'rect' ? `x: ${o.x}, y: ${o.y}, w: ${o.w}, h: ${o.h}` : `x: ${o.x}, y: ${o.y}, r: ${o.r}`;
  const tier = o.fromDifficulty ? `, fromDifficulty: '${o.fromDifficulty}'` : '';
  return `    { kind: '${o.kind}', ${dims}, material: '${o.material}'${tier} },`;
}

const summary: string[] = [];
for (const mode of ['zen', 'mystery', 'tension', 'cheerful'] as const) {
  mkdirSync(join(ROOT, mode), { recursive: true });
  for (let n = FIRST[mode]; n <= LAST; n++) {
    const id = `${mode}-${String(n).padStart(2, '0')}`;
    // Difficulty of the layout itself grows along the journey (first levels stay gentle).
    const d = Math.min(1, Math.max(0, (n - 2) / 26));
    const type = n <= 2 ? 'scatter' : ROTATION[mode][(n + (mode === 'mystery' ? 0 : 1)) % ROTATION[mode].length]!;
    let found: Checked | null = null;
    let seed = SEED_BASE[mode] + n * 97;
    for (let attempt = 0; attempt < 3000 && !found; attempt++, seed++) {
      const r = rng(seed);
      // Mazes must really make you wander, and more so later in the journey.
      // (The small 2-column mazes of Zen and Cheerful can't hold routes as long.)
      const bigMaze = mode === 'mystery' || mode === 'tension';
      const minRoute = type === 'maze' ? (bigMaze ? 950 + 750 * d : 900 + 350 * d) : 760;
      found = check(build(type, r, d, mode), n, r, SPOTS[mode], minRoute);
    }
    if (!found) throw new Error(`no valid layout for ${id} (${type})`);
    seed--;
    const { target: targetSound, ambience } = sounds(mode, n);
    const time = Math.min(180, Math.max(65, Math.round(((found.routeLength / PLAYER_SPEED) * 4 + 35) / 5) * 5)) + (mode === 'tension' ? 10 : 0);
    const name = `${mode}${String(n).padStart(2, '0')}`;
    const lines = [
      `import type { LevelDefinition } from '../types';`,
      '',
      '/**',
      ` * Layout: ${found.note}. Route to the target ≈ ${Math.round(found.routeLength)} units.`,
      ` * Generated by scripts/generate-levels.ts (seed ${seed}); edit the generator, not this file.`,
      ' */',
      `export const ${name}: LevelDefinition = {`,
      `  id: '${id}',`,
      `  mode: '${mode}',`,
      `  index: ${n},`,
      `  start: { x: ${found.start.x}, y: ${found.start.y} },`,
      `  target: { position: { x: ${found.target.x}, y: ${found.target.y} }, sound: '${targetSound}' },`,
      '  obstacles: [',
      ...found.obstacles.map(fmtObstacle),
      '  ],',
      '  collectibles: [',
      ...collectibles(mode, n, id, found.spots),
      '  ],',
      ...(mode === 'tension'
        ? [
            '  // It appears where you began, a few seconds after you set off.',
            `  chaser: { start: { x: ${found.start.x}, y: ${found.start.y} }, delaySeconds: ${n <= 3 ? 10 : 8} },`,
          ]
        : []),
      `  ambience: '${ambience}',`,
      `  baseTimeSeconds: ${time},`,
      ...(STAR_GATES[n] ? [`  requiredStars: ${STAR_GATES[n]},`] : []),
      `  revealImage: require('@assets/images/${mode}/${id}.webp'),`,
      '};',
      '',
    ];
    writeFileSync(join(ROOT, mode, `${id}.ts`), lines.join('\n'));
    summary.push(`${id.padEnd(12)} ${found.note.padEnd(28)} route ${String(Math.round(found.routeLength)).padStart(4)}  time ${time}s  obstacles ${found.obstacles.length}`);
  }
}

// ------------------------------------------------------------------ index.ts

const pad = (n: number) => String(n).padStart(2, '0');
const all = (mode: Mode) => Array.from({ length: LAST }, (_, i) => `${mode}${pad(i + 1)}`);
const imports = (mode: Mode) => all(mode).map((v, i) => `import { ${v} } from './${mode}/${mode}-${pad(i + 1)}';`);
const index = [
  `import { atLeast, type Difficulty } from '@/game/difficulty';`,
  '',
  ...imports('cheerful'),
  ...imports('mystery'),
  ...imports('tension'),
  `import { test01 } from './test/test-01';`,
  `import type { LevelDefinition, Obstacle } from './types';`,
  ...imports('zen'),
  '',
  'export type {',
  '  CollectibleDefinition,',
  '  LevelDefinition,',
  '  Obstacle,',
  '  ObstacleMaterial,',
  '  TargetDefinition,',
  `} from './types';`,
  '',
  `/** Every level in the game. Journey order comes from each level's \`index\`. */`,
  '// prettier-ignore',
  'const ALL_LEVELS: readonly LevelDefinition[] = [',
  ...(['zen', 'mystery', 'tension', 'cheerful'] as const).map((m) => `  ${all(m).join(', ')},`),
  '  test01,',
  '];',
  '',
  'const byId = new Map(ALL_LEVELS.map((level) => [level.id, level]));',
  '',
  'export function allLevels(): readonly LevelDefinition[] {',
  '  return ALL_LEVELS;',
  '}',
  '',
  'export function getLevel(id: string): LevelDefinition | undefined {',
  '  return byId.get(id);',
  '}',
  '',
  '/** The obstacles that exist at a given difficulty. */',
  'export function obstaclesFor(level: LevelDefinition, difficulty: Difficulty): Obstacle[] {',
  '  return level.obstacles.filter((o) => !o.fromDifficulty || atLeast(difficulty, o.fromDifficulty));',
  '}',
  '',
];
writeFileSync(join(ROOT, 'index.ts'), index.join('\n'));
console.log(summary.join('\n'));
console.log(`\nwrote ${summary.length} levels`);
