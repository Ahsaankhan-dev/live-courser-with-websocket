'use client';

import { useRef } from 'react';
import { useCursors, useWebSocket } from '@/hooks/useWebSocket';
import { useMousePosition } from '@/hooks/useMouse';

// userId se ek fixed rang banao
function colorFor(id) {
    let hash = 0;
    for (const ch of String(id)) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
    return `hsl(${hash}, 80%, 55%)`;
}

export default function LiveCursors() {
    const { send } = useWebSocket();
    const cursors = useCursors();
    const lastSent = useRef(0);

    // apna mouse server ko bhejo (max 20/sec)
    useMousePosition(({ x, y }) => {
        const now = Date.now();
        if (now - lastSent.current < 50) return;
        lastSent.current = now;
        send({ type: 'cursor', X: x / window.innerWidth, Y: y / window.innerHeight });
    });

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {Object.entries(cursors).map(([id, c]) => {
                const color = colorFor(id);
                return (
                    <div
                        key={id}
                        className="absolute"
                        style={{
                            left: `${c.x * 100}%`,
                            top: `${c.y * 100}%`,
                            transition: 'left 60ms linear, top 60ms linear',
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
                            <path d="M3 2l7 19 3-8 8-3z" />
                        </svg>
                        <span
                            className="ml-4 rounded px-1.5 py-0.5 text-xs text-white"
                            style={{ background: color }}
                        >
                            {c.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}