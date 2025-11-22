// socket.ts - Real-time temporarily disabled for MySQL version

import type { Operation } from '../store/operationsStore';

// Disable all socket features for now
export const initSocket = () => {
  console.warn("⚠️ Real-time disabled. Backend socket server not running.");
  return null;
};

export const disconnectSocket = () => {
  return null;
};

export const getSocket = () => {
  return null;
};

// Dummy listeners (prevent app breaking)
export const socket = null;
