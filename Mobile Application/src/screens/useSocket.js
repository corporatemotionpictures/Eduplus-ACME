import io from "socket.io-client";
import { useEffect } from "react";

const socket = io()
export  function useSocket(eventName, cb) {
  useEffect(() => {
    socket.on(eventName, cb)
    return function useSocketCleanup() {
      socket.off(eventName, cb)
    }
  }, [eventName, cb])
  return socket
}
