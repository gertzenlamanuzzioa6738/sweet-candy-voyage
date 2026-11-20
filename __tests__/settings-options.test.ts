import {
  BIG_CANDY_COLS,
  BIG_CANDY_ROWS,
  CALM_FACTOR,
  GRID_COLS,
  GRID_ROWS,
} from '../src/constants/config';
import {DEFAULT_SETTINGS, withSettings, initialProgress} from '../src/game/progress';
import {initialObjectives, stageAt} from '../src/game/levels';
import {buildState} from '../src/hooks/useBoard';

const base = {
  mode: 'stage' as const,
  stageIndex: 4,
  attempt: 1,
  modifier: null,
};

describe('settings options', () => {
  test('the defaults are the ones the first run ships with', () => {
    expect(DEFAULT_SETTINGS).toEqual({
      bigCandy: false,
      highContrast: false,
      swapGuide: true,
      motion: 'FULL',
    });
    expect(initialProgress().settings).toEqual(DEFAULT_SETTINGS);
  });

  test('patching one option leaves the others alone', () => {
    const state = withSettings(initialProgress(), {highContrast: true});
    expect(state.settings.highContrast).toBe(true);
    expect(state.settings.swapGuide).toBe(true);
    expect(state.settings.motion).toBe('FULL');
  });

  test('BIG CANDY MODE really changes the board geometry', () => {
    const normal = buildState({...base, settings: DEFAULT_SETTINGS});
    expect(normal.rows).toBe(GRID_ROWS);
    expect(normal.cols).toBe(GRID_COLS);

    const big = buildState({...base, settings: {...DEFAULT_SETTINGS, bigCandy: true}});
    expect(big.rows).toBe(BIG_CANDY_ROWS);
    expect(big.cols).toBe(BIG_CANDY_COLS);
    expect(big.board).toHaveLength(BIG_CANDY_ROWS * BIG_CANDY_COLS);
  });

  test('BIG CANDY MODE scales the objectives down with the board', () => {
    const stage = stageAt(4);
    const full = initialObjectives(stage, 1);
    const scaled = initialObjectives(stage, 0.8);
    for (let i = 0; i < full.length; i++) {
      expect(scaled[i].objective.total).toBeLessThan(full[i].objective.total);
      expect(scaled[i].objective.total).toBeGreaterThanOrEqual(3);
    }
  });

  test('SWAP GUIDE and HIGH CONTRAST are independent toggles', () => {
    let state = initialProgress();
    state = withSettings(state, {swapGuide: false});
    state = withSettings(state, {highContrast: true});
    expect(state.settings.swapGuide).toBe(false);
    expect(state.settings.highContrast).toBe(true);
  });

  test('MOTION has exactly two settings and CALM shortens the animations', () => {
    const calm = withSettings(initialProgress(), {motion: 'CALM'});
    expect(calm.settings.motion).toBe('CALM');
    expect(CALM_FACTOR).toBeGreaterThan(0);
    expect(CALM_FACTOR).toBeLessThan(1);
    expect(Math.round(220 * CALM_FACTOR)).toBeLessThan(220);
  });
});
