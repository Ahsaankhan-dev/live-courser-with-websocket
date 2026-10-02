'use client';

import { useEffect, useState } from 'react';

export function useWebSocket() {
  const [status, setStatus] = useState('connecting');
  const [onlineUserIds, setOnlineUserIds] = useState([]);

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
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'presence' && Array.isArray(message.onlineUserIds)) {
          if (active) setOnlineUserIds(message.onlineUserIds.map(String));
          return;
        }
        console.info('[WebSocket] Message received:', message);
      } catch (error) {
        console.error('[WebSocket] Could not parse server message:', error, event.data);
      }
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
      if (active) {
        setStatus('disconnected');
        setOnlineUserIds([]);
      }
    };

    return () => {
      active = false;
      console.info('[WebSocket] Closing connection (component cleanup)');
      socket.close();
    };
  }, []);

  return { status, onlineUserIds };
}
