/**
 * Per-mode colour palettes.
 *
 * Each journey (mode) has its own colour identity: the player glow, the trail
 * gradient that paints behind the player, the hint glow and the wave rings.
 * Adding a new mode only needs a new entry here plus a mode definition in
 * `src/modes/`.
 */
export interface ModePalette {
  /** Colour of the player dot's glow. */
  playerGlow: string;
  /** Trail colours; the trail slowly cycles through these as you walk. */
  trail: readonly string[];
  /** Hint light shown in the target direction. */
  hint: string;
  /** Wave rings used in no-headphone mode. */
  waves: string;
  /** Accent used for mode cards, stars and highlights in menus. */
  accent: string;
  /** Very dark tint behind the level, so each world feels different. */
  backgroundTint: string;
}

export const palettes = {
  /** Zen: pastel nature walk through one day (dawn → night). */
  zen: {
    playerGlow: '#FFF4DC',
    trail: ['#F7C8B4', '#F3DFA2', '#B9DCC6', '#A8C8EA', '#C9B8E8'],
    hint: '#FFF7E0',
    waves: '#BFE3D2',
    accent: '#B9DCC6',
    backgroundTint: '#060A0A',
  },
  /** Mystery: abandoned mansion, candlelight, amber and wine. */
  mystery: {
    playerGlow: '#FFD9A0',
    trail: ['#E3B26B', '#C98A5B', '#9E5A5A', '#7A4F6E', '#D9C08F'],
    hint: '#FFE2B0',
    waves: '#E3B26B',
    accent: '#E3B26B',
    backgroundTint: '#0A0706',
  },
  /** Tension (coming later). */
  tension: {
    playerGlow: '#FFD0D0',
    trail: ['#B23A48', '#7A1F2B', '#E06C75'],
    hint: '#FFB3B3',
    waves: '#E06C75',
    accent: '#E06C75',
    backgroundTint: '#0A0505',
  },
  /** Cheerful (coming later). */
  cheerful: {
    playerGlow: '#FFFFFF',
    trail: ['#FF8FAB', '#FFD166', '#8BE9A8', '#6EC6FF', '#C792EA'],
    hint: '#FFFFFF',
    waves: '#FFD166',
    accent: '#FFD166',
    backgroundTint: '#07060A',
  },
} as const satisfies Record<string, ModePalette>;

export type PaletteKey = keyof typeof palettes;
