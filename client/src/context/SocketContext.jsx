import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (user) {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const defaultSocketUrl = apiUrl ? apiUrl.replace(/\/api\/?$/, '') : 'http://localhost:5000';
      const socketUrl = import.meta.env.VITE_SOCKET_URL || defaultSocketUrl;
      const newSocket = io(socketUrl, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10
      });

      newSocket.on('connect', () => {
        setConnected(true);
        newSocket.emit('join_user', user.id);
      });

      newSocket.on('disconnect', () => {
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) socket.close();
      setSocket(null);
      setConnected(false);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
