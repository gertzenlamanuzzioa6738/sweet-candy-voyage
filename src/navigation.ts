/**
 * The whole navigation model: one union, one owner (App.tsx).
 * No navigation library — forward moves push onto a small stack, Back pops it,
 * and Back on the Menu leaves the app. The loader is never on the stack.
 */
export type ScreenName =
  | 'loader'
  | 'menu'
  | 'tutorial'
  | 'map'
  | 'game'
  | 'result'
  | 'recipes'
  | 'collection'
  | 'daily'
  | 'settings';

export const ROOT_SCREEN: ScreenName = 'menu';
