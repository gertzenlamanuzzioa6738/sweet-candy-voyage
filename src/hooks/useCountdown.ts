import {useEffect, useRef, useState} from 'react';

/**
 * Daily-challenge timer. It really pauses: the remaining time is kept in a ref, so the
 * pause popup freezes the run instead of letting it tick away behind the scrim. The
 * interval is always cleared when the screen is left.
 */
export function useCountdown(
  durationMs: number,
  running: boolean,
  onExpire: () => void,
): number {
  const [left, setLeft] = useState(durationMs);
  const leftRef = useRef(durationMs);
  const firedRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running) {
      return;
    }
    const endAt = Date.now() + leftRef.current;
    const id = setInterval(() => {
      const remaining = Math.max(0, endAt - Date.now());
      leftRef.current = remaining;
      setLeft(remaining);
      if (remaining === 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current();
      }
    }, 100);
    return () => clearInterval(id);
  }, [running]);

  return left;
}

export function formatSeconds(ms: number): string {
  return `${Math.ceil(ms / 1000)}s`;
}

export default useCountdown;
