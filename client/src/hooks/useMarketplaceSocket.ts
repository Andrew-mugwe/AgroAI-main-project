import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  thread_ref: string;
  data: any;
  timestamp: string;
}

interface UseMarketplaceSocketProps {
  userId: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useMarketplaceSocket = ({ 
  userId, 
  onMessage, 
  onConnect, 
  onDisconnect 
}: UseMarketplaceSocketProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedThreads = useRef<Set<string>>(new Set());

  const connect = () => {
    try {
      const wsUrl = `ws://localhost:8080/ws/marketplace?user_id=${userId}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        onConnect?.();
        
        // Resubscribe to all threads
        subscribedThreads.current.forEach(threadRef => {
          subscribe(threadRef);
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnect?.();
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error');
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to create WebSocket connection');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  const subscribe = (threadRef: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        thread_ref: threadRef
      }));
      subscribedThreads.current.add(threadRef);
    }
  };

  const unsubscribe = (threadRef: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        thread_ref: threadRef
      }));
      subscribedThreads.current.delete(threadRef);
    }
  };

  const sendPing = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'ping'
      }));
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [userId]);

  // Send ping every 30 seconds to keep connection alive
  useEffect(() => {
    const pingInterval = setInterval(() => {
      sendPing();
    }, 30000);

    return () => {
      clearInterval(pingInterval);
    };
  }, []);

  return {
    isConnected,
    error,
    subscribe,
    unsubscribe,
    connect,
    disconnect
  };
};
