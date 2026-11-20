export type Reward = {
  id: string;
  name: string;
  starCost: number;
  tint: string;
  /** which generated sprite dresses the card (1..5) */
  sprite: number;
};

/** 12 decorative garden ornaments. Virtual only: no currency, no purchases. */
export const REWARDS: Reward[] = [
  {id: 'sugar-lantern', name: 'SUGAR LANTERN', starCost: 2, tint: '#FFC23C', sprite: 2},
  {id: 'candy-arch', name: 'CANDY ARCH', starCost: 5, tint: '#FF69B4', sprite: 1},
  {id: 'mint-fountain', name: 'MINT FOUNTAIN', starCost: 8, tint: '#3ED6B5', sprite: 3},
  {id: 'berry-bench', name: 'BERRY BENCH', starCost: 11, tint: '#FF4D6D', sprite: 4},
  {id: 'grape-trellis', name: 'GRAPE TRELLIS', starCost: 14, tint: '#9B59B6', sprite: 5},
  {id: 'caramel-bridge', name: 'CARAMEL BRIDGE', starCost: 17, tint: '#C97B3C', sprite: 2},
  {id: 'lollipop-tree', name: 'LOLLIPOP TREE', starCost: 20, tint: '#FF8FC8', sprite: 1},
  {id: 'frosting-gazebo', name: 'FROSTING GAZEBO', starCost: 23, tint: '#5DADE2', sprite: 3},
  {id: 'taffy-swing', name: 'TAFFY SWING', starCost: 26, tint: '#FFB36B', sprite: 4},
  {id: 'marshmallow-cloud', name: 'MARSHMALLOW CLOUD', starCost: 29, tint: '#D6B8E8', sprite: 5},
  {id: 'sherbet-pond', name: 'SHERBET POND', starCost: 32, tint: '#1FA98C', sprite: 3},
  {id: 'sugar-obelisk', name: 'SUGAR OBELISK', starCost: 36, tint: '#9B59B6', sprite: 1},
];

export function rewardById(id: string): Reward | undefined {
  return REWARDS.find(r => r.id === id);
}

export function unlockedRewardIds(stars: number): string[] {
  return REWARDS.filter(r => stars >= r.starCost).map(r => r.id);
}

/** Ornaments whose milestone was crossed between two star totals. */
export function newlyUnlocked(before: number, after: number): Reward[] {
  return REWARDS.filter(r => r.starCost > before && r.starCost <= after);
}
