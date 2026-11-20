import React from 'react';
import renderer, {act} from 'react-test-renderer';

// the test renderer has no native view tree for the animation bridge to attach to
jest.mock('react-native/src/private/animated/NativeAnimatedHelper');

jest.mock('react-native-linear-gradient', () => {
  const {View} = require('react-native');
  return {__esModule: true, default: View};
});

jest.mock('react-native-svg', () => {
  const {View} = require('react-native');
  const React2 = require('react');
  const make = (name: string) => {
    const C = (props: any) => React2.createElement(View, props, props.children);
    C.displayName = name;
    return C;
  };
  const names = [
    'Svg','Circle','Ellipse','G','Text','TSpan','TextPath','Path','Polygon','Polyline',
    'Line','Rect','Use','Image','Symbol','Defs','LinearGradient','RadialGradient','Stop',
    'ClipPath','Pattern','Mask','Marker','ForeignObject',
  ];
  const mod: Record<string, unknown> = {__esModule: true, default: make('Svg')};
  for (const n of names) { mod[n] = make(n); }
  return mod;
});

import App from '../App';
import {LoaderScreen} from '../src/screens/LoaderScreen';
import {MenuScreen} from '../src/screens/MenuScreen';
import {TutorialScreen} from '../src/screens/TutorialScreen';
import {MapScreen} from '../src/screens/MapScreen';
import {GameScreen} from '../src/screens/GameScreen';
import {ResultScreen} from '../src/screens/ResultScreen';
import {RecipeBookScreen} from '../src/screens/RecipeBookScreen';
import {CollectionScreen} from '../src/screens/CollectionScreen';
import {DailyChallengeScreen} from '../src/screens/DailyChallengeScreen';
import {SettingsScreen} from '../src/screens/SettingsScreen';
import {DEFAULT_SETTINGS, initialProgress} from '../src/game/progress';

const noop = () => {};

function draw(node: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | null = null;
  act(() => {
    tree = renderer.create(node);
  });
  act(() => {
    tree!.unmount();
  });
}

describe('every screen renders without blowing up', () => {
  test('App', () => draw(<App />));
  test('Loader', () => draw(<LoaderScreen />));
  test('Menu empty save', () =>
    draw(
      <MenuScreen
        stars={0}
        bestChain={0}
        currentStage={0}
        dailyUnplayed
        onPlay={noop}
        onRoute={noop}
      />,
    ));
  test('Menu with stats', () =>
    draw(
      <MenuScreen
        stars={12}
        bestChain={4}
        currentStage={3}
        dailyUnplayed={false}
        onPlay={noop}
        onRoute={noop}
      />,
    ));
  test('Tutorial', () => draw(<TutorialScreen onDone={noop} onMenu={noop} />));
  test('Map', () =>
    draw(
      <MapScreen stars={7} records={{0: {stars: 3, score: 10}}} currentStage={1} onStart={noop} onMenu={noop} />,
    ));
  test('Game stage', () =>
    draw(
      <GameScreen
        mode="stage"
        stageIndex={0}
        attempt={1}
        settings={DEFAULT_SETTINGS}
        modifier={null}
        onStageEnd={noop}
        onLeave={noop}
        onMenu={noop}
        onTutorial={noop}
      />,
    ));
  test('Game daily with every setting flipped', () =>
    draw(
      <GameScreen
        mode="daily"
        stageIndex={5}
        attempt={2}
        settings={{bigCandy: true, highContrast: true, swapGuide: false, motion: 'CALM'}}
        modifier={{
          id: 'sugar-rush',
          name: 'SUGAR RUSH',
          description: 'x',
          syrupMultiplier: 1,
          splashPerLink: 2,
          maxDrips: 5,
          doubleCandy: 2,
        }}
        onStageEnd={noop}
        onLeave={noop}
        onMenu={noop}
        onTutorial={noop}
      />,
    ));
  test('Result win', () =>
    draw(
      <ResultScreen
        summary={{
          outcome: 'win',
          mode: 'stage',
          stageIndex: 2,
          recipe: 'MINT RIBBON ROLL',
          location: 'SUGAR MEADOW',
          score: 4820,
          stars: 3,
          bestChain: 4,
          syrupCleared: 9,
          movesLeft: 8,
          movesTotal: 20,
          newIngredient: 'MINT LEAF',
          newRewards: ['SUGAR LANTERN'],
          modifier: null,
        }}
        onAgain={noop}
        onNext={noop}
        onMenu={noop}
      />,
    ));
  test('Result loss with nothing to show', () =>
    draw(
      <ResultScreen
        summary={{
          outcome: 'spill',
          mode: 'stage',
          stageIndex: 11,
          recipe: 'CANDY CURRENT CAKE',
          location: 'FROSTING PEAK',
          score: 0,
          stars: 0,
          bestChain: 0,
          syrupCleared: 0,
          movesLeft: 0,
          movesTotal: 20,
          newIngredient: null,
          newRewards: [],
          modifier: null,
        }}
        onAgain={noop}
        onNext={noop}
        onMenu={noop}
      />,
    ));
  test('Recipe book empty', () =>
    draw(<RecipeBookScreen discovered={[]} records={{}} onMenu={noop} />));
  test('Recipe book filled', () =>
    draw(<RecipeBookScreen discovered={[0, 1]} records={{0: {stars: 3, score: 1}}} onMenu={noop} />));
  test('Collection empty', () =>
    draw(<CollectionScreen ingredients={{}} rewards={[]} onMenu={noop} />));
  test('Collection filled', () =>
    draw(<CollectionScreen ingredients={{'mint-leaf': 2}} rewards={['sugar-lantern']} onMenu={noop} />));
  test('Daily fresh', () =>
    draw(
      <DailyChallengeScreen
        daily={initialProgress().daily}
        onStart={noop}
        onViewResult={noop}
        onMenu={noop}
      />,
    ));
  test('Settings', () =>
    draw(
      <SettingsScreen settings={DEFAULT_SETTINGS} onChange={noop} onErase={noop} onMenu={noop} />,
    ));
});
