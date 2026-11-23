'use client';

import { useEffect, useRef, useState } from 'react';

export function useMousePosition(onMove) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const frame = useRef(null);
  const latest = useRef({ x: 0, y: 0 });
  const onMoveRef = useRef(onMove);

  // callback badle to latest wala use ho, listener dobara na lagana pare
  useEffect(() => {
    onMoveRef.current = onMove;
  }, [onMove]);

  useEffect(() => {
    const handleMove = (e) => {
      // ek frame mein sirf ek baar update (performance ke liye)
      latest.current = { x: e.clientX, y: e.clientY };
      if (frame.current) return;

      frame.current = requestAnimationFrame(() => {
        const pos = latest.current;
        setPosition(pos);
        onMoveRef.current?.(pos);
        frame.current = null;
      });
    };

    window.addEventListener('mousemove', handleMove);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, []);

  return position;
}