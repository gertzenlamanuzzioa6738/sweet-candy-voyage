import {hydrate, serialize} from './progress';
import type {ProgressState} from './progress';

/**
 * The ONE write point for persistence.
 *
 * The approved dependency list has no storage module, so this ships as an in-process
 * adapter: progress is a single source of truth across every screen and survives
 * navigation and in-session restarts. If a storage dependency is approved later this
 * is the only file that changes — nothing else in the app touches persistence.
 */
let slot: string | null = null;

export function loadProgress(): ProgressState {
  return hydrate(slot);
}

export function saveProgress(state: ProgressState): void {
  slot = serialize(state);
}

export function clearProgress(): void {
  slot = null;
}
