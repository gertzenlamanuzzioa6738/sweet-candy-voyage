export type CandyType = 0 | 1 | 2 | 3 | 4;

export type Tile = {
  /** stable identity so an <Image> is not remounted while it falls */
  id: number;
  type: CandyType;
  /** 0 = clean, 1 = syrup, 2 = thick syrup. A syrup tile is locked in place. */
  syrup: number;
};

export type Board = (Tile | null)[];

export type Objective =
  | {kind: 'candy'; candy: CandyType; total: number}
  | {kind: 'syrup'; total: number};

export type ObjectiveState = {
  objective: Objective;
  done: number;
};

export type Outcome = 'win' | 'moves' | 'spill' | 'time';

export type GameMode = 'stage' | 'daily';

export type StageDef = {
  /** 0-based */
  index: number;
  location: string;
  recipe: string;
  moves: number;
  objectives: Objective[];
  syrupTiles: number;
  thickSyrup: boolean;
  keyCandy: CandyType;
};

export type RoundSummary = {
  outcome: Outcome;
  mode: GameMode;
  stageIndex: number;
  recipe: string;
  location: string;
  score: number;
  stars: number;
  bestChain: number;
  syrupCleared: number;
  movesLeft: number;
  movesTotal: number;
  newIngredient: string | null;
  newRewards: string[];
  modifier: string | null;
};

export type Rng = () => number;
