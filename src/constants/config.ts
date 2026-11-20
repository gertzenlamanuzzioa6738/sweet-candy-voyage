/**
 * SweetCandyVoyage — tunable gameplay constants.
 * Every number the game balance depends on lives here, nothing is magic in the screens.
 */

/** Splash hold. Exactly 8000 ms — the QA capture needs 4-6 s to reach its first frame. */
export const LOADER_DURATION_MS = 8000;

/** Board geometry */
export const GRID_COLS = 6;
export const GRID_ROWS = 6;
export const BIG_CANDY_COLS = 5;
export const BIG_CANDY_ROWS = 5;
export const CANDY_TYPES = 5;

/** Board frame maths (rule: zero overflow on a 1080x2400 phone) */
export const BOARD_PAD = 8;
export const BOARD_BORDER = 3;
export const BOARD_FRAME = BOARD_PAD + BOARD_BORDER;
export const BOARD_MAX_W = 380;

/** Syrup pot */
export const MAX_DRIPS = 5;
export const TIGHT_POT_DRIPS = 3;

/** Splash booster */
export const SPLASH_MAX = 5;
export const SPLASH_RADIUS = 1; // 3x3 block

/** Scoring */
export const SCORE_PER_CANDY = 60;
export const MAX_MULTIPLIER = 4;
export const MULTIPLIER_STEP = 0.5;

/** Sugar Rush: every 3rd link of one chain refunds a move, capped per stage */
export const REFUND_EVERY_LINK = 3;
export const MAX_REFUNDS = 3;

/** Stars */
export const STAR3_RATIO = 0.35;
export const STAR2_RATIO = 0.15;
export const TOTAL_STARS = 36;
/** Stars needed to open location 1..4 */
export const LOCATION_GATES = [0, 6, 14, 24];

/** Daily challenge */
export const DAILY_DURATION_MS = 90000;
export const DAILY_DANGER_MS = 15000;

/** Deadlock guard */
export const MAX_GENERATION_ATTEMPTS = 20;

/** Animation timings (ms). MOTION=CALM multiplies these by CALM_FACTOR. */
export const T_CLEAR = 220;
export const T_SETTLE = 150;
export const T_SWAP = 180;
export const T_SPOILED = 240;
export const T_FADE = 240;
export const T_BANNER = 900;
export const T_TOAST = 1500;
export const CALM_FACTOR = 0.4;

/** Springs */
export const SPRING_DEFAULT = {tension: 140, friction: 14};
export const SPRING_PRESS = {tension: 300, friction: 12};
export const SPRING_POP = {tension: 70, friction: 7};
