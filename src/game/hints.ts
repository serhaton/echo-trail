import { difficultyRules, type Difficulty } from './difficulty';

/**
 * Hint allowance and timing for one level run. Pure logic driven by the
 * game loop's dt.
 *
 *   ready       a free hint is available now
 *   adRequired  free hints used up; a rewarded video grants one
 *   cooldown    must wait before the next hint (difficulty-dependent)
 *   active      the hint light is currently showing
 */
export type HintStatus = 'ready' | 'adRequired' | 'cooldown' | 'active';

export interface HintSnapshot {
  status: HintStatus;
  freeLeft: number;
  /** Whole seconds until the cooldown ends (0 when not cooling down). */
  cooldownSeconds: number;
}

export class Hints {
  private freeLeft: number;
  private cooldownLeft = 0;
  private activeLeft = 0;
  readonly duration: number;
  private readonly cooldown: number;

  constructor(freeHints: number, difficulty: Difficulty) {
    this.freeLeft = freeHints;
    this.duration = difficultyRules[difficulty].hintDuration;
    this.cooldown = difficultyRules[difficulty].hintCooldown;
  }

  get snapshot(): HintSnapshot {
    let status: HintStatus;
    if (this.activeLeft > 0) status = 'active';
    else if (this.cooldownLeft > 0) status = 'cooldown';
    else status = this.freeLeft > 0 ? 'ready' : 'adRequired';
    return { status, freeLeft: this.freeLeft, cooldownSeconds: Math.ceil(this.cooldownLeft) };
  }

  tick(dt: number) {
    this.activeLeft = Math.max(0, this.activeLeft - dt);
    this.cooldownLeft = Math.max(0, this.cooldownLeft - dt);
  }

  /**
   * Start a hint. Pass `paid: true` when it was granted by a rewarded
   * video (doesn't consume a free hint). Returns false if not allowed now.
   */
  activate(paid = false): boolean {
    const { status } = this.snapshot;
    if (status === 'active' || status === 'cooldown') return false;
    if (!paid) {
      if (this.freeLeft <= 0) return false;
      this.freeLeft--;
    }
    this.activeLeft = this.duration;
    // The cooldown includes the time the light is visible.
    this.cooldownLeft = Math.max(this.cooldown, this.duration);
    return true;
  }
}
