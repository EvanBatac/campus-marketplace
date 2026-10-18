import { useEffect } from "react";
import { socket } from "../socket";

export default function Chat() {
  useEffect(() => {
    socket.auth = { token: localStorage.getItem("token") };

    function onConnect() {
      console.log("socket connected:", socket.id);
    }

    function onConnectError(err) {
      console.log("socket error:", err.message);
    }

    socket.on("connect", onConnect);
    socket.on("connect_error", onConnectError);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, []);
  return <div>Chat</div>;
}
