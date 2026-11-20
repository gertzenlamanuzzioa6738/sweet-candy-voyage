import React, {memo} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {BOARD_FRAME, BOARD_MAX_W} from '../constants/config';
import {colors, radius} from '../constants/theme';
import {CandyTile} from './CandyTile';
import type {BoardState} from '../hooks/useBoard';

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');

/** header 116 + objective strip 56 + controls 186 + breathing room 24 */
const RESERVED = 116 + 56 + 186 + 24;

export function boardMetrics(cols: number, rows: number) {
  const maxW = Math.min(SCREEN_W - 32, BOARD_MAX_W);
  const maxH = Math.max(200, SCREEN_H - RESERVED);
  const tile = Math.floor((Math.min(maxW, maxH) - 2 * BOARD_FRAME) / Math.max(cols, rows));
  return {
    tile,
    width: tile * cols + 2 * BOARD_FRAME,
    height: tile * rows + 2 * BOARD_FRAME,
  };
}

type Props = {
  state: BoardState;
  onTileTap: (index: number) => void;
  highContrast: boolean;
  swapGuide: boolean;
  calm: boolean;
};

/** Claymorph tray holding the grid. Overflow is zero by construction. */
function CandyBoardBase({state, onTileTap, highContrast, swapGuide, calm}: Props) {
  const {tile, width, height} = boardMetrics(state.cols, state.rows);

  return (
    <View style={[styles.tray, {width, height}]}>
      <View pointerEvents="none" style={styles.topLight} />
      {state.board.map((cell, i) => {
        if (!cell) {
          return null;
        }
        const row = Math.floor(i / state.cols);
        const col = i % state.cols;
        return (
          <View
            key={cell.id}
            style={[
              styles.slot,
              {
                left: BOARD_FRAME + col * tile,
                top: BOARD_FRAME + row * tile,
                width: tile,
                height: tile,
              },
            ]}>
            <CandyTile
              index={i}
              type={cell.type}
              syrup={cell.syrup}
              size={tile}
              selected={state.selected === i}
              legal={swapGuide && state.legal.indexOf(i) >= 0}
              clearing={state.clearing.indexOf(i) >= 0}
              highContrast={highContrast}
              calm={calm}
              onPress={onTileTap}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tray: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: '#FFD9EC',
    shadowColor: colors.secondary,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
  topLight: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: 4,
    height: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  slot: {position: 'absolute'},
});

export const CandyBoard = memo(CandyBoardBase);
export default CandyBoard;
