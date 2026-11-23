'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const ConnectionContext = createContext(null);
const CursorsContext = createContext(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const SOCKET_CONFIG = (() => {
  try {
    const url = new URL(API_URL);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return { url: url.toString(), error: null };
  } catch (error) {
    return { url: null, error };
  }
})();

export function WebSocketProvider({ children }) {
  const [status, setStatus] = useState(
    SOCKET_CONFIG.url ? 'connecting' : 'unavailable'
  );
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [cursors, setCursors] = useState({});
  const wsRef = useRef(null);

  useEffect(() => {
    if (!SOCKET_CONFIG.url) {
      console.error('[WebSocket] Invalid backend URL:', API_URL, SOCKET_CONFIG.error);
      return;
    }

    let active = true;
    console.info('[WebSocket] Connecting to', SOCKET_CONFIG.url);
    const socket = new WebSocket(SOCKET_CONFIG.url);
    wsRef.current = socket;

    socket.onopen = () => {
      console.info('[WebSocket] Connected');
      if (active) setStatus('connected');
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (!active) return;

        switch (message.type) {
          case 'presence':
            if (Array.isArray(message.onlineUserIds)) {
              setOnlineUserIds(message.onlineUserIds.map(String));
            }
            break;

          case 'cursor': {
            const { userId, name, X, Y } = message;
            if (
              typeof userId === 'string' &&
              typeof name === 'string' &&
              Number.isFinite(X) &&
              Number.isFinite(Y)
            ) {
              setCursors((prev) => ({ ...prev, [userId]: { x: X, y: Y, name } }));
            }
            break;
          }

          case 'cursor-leave':
            if (typeof message.userId === 'string') {
              setCursors((prev) => {
                const next = { ...prev };
                delete next[message.userId];
                return next;
              });
            }
            break;

          default:
            console.info('[WebSocket] Message received:', message);
        }
      } catch (error) {
        console.error('[WebSocket] Could not parse server message:', error, event.data);
      }
    };

    socket.onerror = (event) => {
      console.error('[WebSocket] Connection error:', event);
      if (active) setStatus('unavailable');
    };

    socket.onclose = (event) => {
      console.info('[WebSocket] Closed:', {
        code: event.code,
        reason: event.reason || '(no reason provided)',
        wasClean: event.wasClean,
      });
      if (active) {
        setStatus('disconnected');
        setOnlineUserIds([]);
        setCursors({});
      }
    };

    return () => {
      active = false;
      console.info('[WebSocket] Closing connection (component cleanup)');
      socket.close();
      wsRef.current = null;
    };
  }, []);

  const send = useCallback((data) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }, []);

  // Keep cursor updates separate so mouse movement does not re-render consumers
  // of the connection state.
  const connection = useMemo(
    () => ({ status, onlineUserIds, send }),
    [status, onlineUserIds, send]
  );

  return (
    <ConnectionContext.Provider value={connection}>
      <CursorsContext.Provider value={cursors}>
        {children}
      </CursorsContext.Provider>
    </ConnectionContext.Provider>
  );
}

export function useWebSocket() {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useWebSocket must be used inside <WebSocketProvider>');
  return ctx;
}

export function useCursors() {
  const ctx = useContext(CursorsContext);
  if (!ctx) throw new Error('useCursors must be used inside <WebSocketProvider>');
  return ctx;
}