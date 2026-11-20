import {CANDY_NAMES, STAGES} from './levels';
import type {CandyType} from './types';

export type Recipe = {
  stageIndex: number;
  name: string;
  location: string;
  keyCandy: CandyType;
  ingredients: string[];
};

export type IngredientShape =
  | 'circle'
  | 'star'
  | 'leaf'
  | 'drop'
  | 'diamond'
  | 'triangle'
  | 'square'
  | 'hex';

export type Ingredient = {
  id: string;
  name: string;
  tint: string;
  shape: IngredientShape;
};

export const INGREDIENTS: Ingredient[] = [
  {id: 'candied-lemon', name: 'CANDIED LEMON', tint: '#FFC23C', shape: 'circle'},
  {id: 'sugar-petal', name: 'SUGAR PETAL', tint: '#FF8FC8', shape: 'star'},
  {id: 'mint-leaf', name: 'MINT LEAF', tint: '#3ED6B5', shape: 'leaf'},
  {id: 'berry-jam', name: 'BERRY JAM', tint: '#FF4D6D', shape: 'drop'},
  {id: 'grape-dust', name: 'GRAPE DUST', tint: '#9B59B6', shape: 'diamond'},
  {id: 'caramel-shard', name: 'CARAMEL SHARD', tint: '#C97B3C', shape: 'triangle'},
  {id: 'vanilla-bean', name: 'VANILLA BEAN', tint: '#E3C07B', shape: 'square'},
  {id: 'rose-syrup', name: 'ROSE SYRUP', tint: '#FF69B4', shape: 'hex'},
];

export function ingredientById(id: string): Ingredient | undefined {
  return INGREDIENTS.find(i => i.id === id);
}

export const RECIPES: Recipe[] = STAGES.map(stage => ({
  stageIndex: stage.index,
  name: stage.recipe,
  location: stage.location,
  keyCandy: stage.keyCandy,
  ingredients: [
    INGREDIENTS[stage.index % INGREDIENTS.length].name,
    INGREDIENTS[(stage.index + 3) % INGREDIENTS.length].name,
    CANDY_NAMES[stage.keyCandy],
  ],
}));

/** A mastery clear on this stage drops this rare ingredient into the Collection. */
export function masteryIngredient(stageIndex: number): Ingredient {
  return INGREDIENTS[Math.abs(stageIndex) % INGREDIENTS.length];
}
