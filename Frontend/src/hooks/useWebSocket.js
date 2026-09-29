'use client';

import { useEffect, useState } from 'react';

export function useWebSocket() {
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    let socketUrl;

    try {
      socketUrl = new URL(apiUrl);
      socketUrl.protocol = socketUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    } catch (error) {
      console.error('[WebSocket] Invalid backend URL:', apiUrl, error);
      setStatus('unavailable');
      return undefined;
    }

    let socket;
    let active = true;

    try {
      console.info('[WebSocket] Connecting to', socketUrl.toString());
      socket = new WebSocket(socketUrl.toString());
    } catch (error) {
      console.error('[WebSocket] Could not create connection:', error);
      setStatus('unavailable');
      return undefined;
    }

    socket.onopen = () => {
      console.info('[WebSocket] Connected');
      if (active) setStatus('connected');
    };

    socket.onmessage = (event) => {
      console.info('[WebSocket] Message received:', event.data);
    };

    socket.onerror = (event) => {
      console.log('[WebSocket] Connection error:', event);
      if (active) setStatus('unavailable');
    };

    socket.onclose = (event) => {
      console.info('[WebSocket] Closed:', {
        code: event.code,
        reason: event.reason || '(no reason provided)',
        wasClean: event.wasClean,
      });
      if (active) setStatus('disconnected');
    };

    return () => {
      active = false;
      console.info('[WebSocket] Closing connection (component cleanup)');
      socket.close();
    };
  }, []);

  return status;
}
