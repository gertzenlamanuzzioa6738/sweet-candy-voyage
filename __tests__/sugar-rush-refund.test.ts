import {MAX_REFUNDS, REFUND_EVERY_LINK} from '../src/constants/config';
import {grantsRefund} from '../src/game/cascade';

describe('sugar rush move refund', () => {
  test('every third link of one chain buys a move back', () => {
    expect(REFUND_EVERY_LINK).toBe(3);
    expect(grantsRefund(1, 0)).toBe(false);
    expect(grantsRefund(2, 0)).toBe(false);
    expect(grantsRefund(3, 0)).toBe(true);
    expect(grantsRefund(6, 1)).toBe(true);
    expect(grantsRefund(9, 2)).toBe(true);
  });

  test('the refund is capped per stage', () => {
    expect(MAX_REFUNDS).toBe(3);
    expect(grantsRefund(12, MAX_REFUNDS)).toBe(false);
    expect(grantsRefund(15, MAX_REFUNDS + 2)).toBe(false);
  });

  test('a short chain never refunds', () => {
    for (let link = 1; link < REFUND_EVERY_LINK; link++) {
      expect(grantsRefund(link, 0)).toBe(false);
    }
  });
});
