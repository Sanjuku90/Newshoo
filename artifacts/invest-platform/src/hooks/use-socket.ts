import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/socket";

export function useSocket(token: string | null): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    const s = getSocket(token);
    socketRef.current = s;
    s.emit("join_user_room");
    return () => {};
  }, [token]);

  return socketRef.current;
}
