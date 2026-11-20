import React, {memo} from 'react';
import Svg, {Circle, Path, Polygon, Rect} from 'react-native-svg';

export type GlyphShape =
  | 'circle'
  | 'square'
  | 'diamond'
  | 'triangle'
  | 'star'
  | 'leaf'
  | 'drop'
  | 'hex';

type Props = {
  shape: GlyphShape;
  size: number;
  color: string;
  opacity?: number;
};

/**
 * Vector marks drawn in-app — used for the HIGH CONTRAST candy marks and for the
 * ingredient glyphs. Each shape is visibly different, so a set of them never collapses
 * into one fallback character the way emoji do.
 */
function ShapeGlyphBase({shape, size, color, opacity = 1}: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" opacity={opacity}>
      {shape === 'circle' ? <Circle cx={12} cy={12} r={8} fill={color} /> : null}
      {shape === 'square' ? (
        <Rect x={5} y={5} width={14} height={14} rx={3} fill={color} />
      ) : null}
      {shape === 'diamond' ? (
        <Polygon points="12,3 21,12 12,21 3,12" fill={color} />
      ) : null}
      {shape === 'triangle' ? <Polygon points="12,4 21,20 3,20" fill={color} /> : null}
      {shape === 'star' ? (
        <Polygon
          points="12,2 14.8,9 22,9.4 16.4,14 18.3,21 12,17 5.7,21 7.6,14 2,9.4 9.2,9"
          fill={color}
        />
      ) : null}
      {shape === 'leaf' ? (
        <Path d="M20 4C9 4 4 9 4 20c11 0 16-5 16-16z" fill={color} />
      ) : null}
      {shape === 'drop' ? (
        <Path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z" fill={color} />
      ) : null}
      {shape === 'hex' ? (
        <Polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" fill={color} />
      ) : null}
    </Svg>
  );
}

export const ShapeGlyph = memo(ShapeGlyphBase);

/** The five candy types get five distinct marks when HIGH CONTRAST is on. */
export const CANDY_SHAPES: GlyphShape[] = ['circle', 'square', 'diamond', 'triangle', 'star'];

export default ShapeGlyph;
