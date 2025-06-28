import { SocketProvider } from "@/context/SocketContext";

export default function ConsoleLayout({ children }) {
  return (
    <SocketProvider>
        <div>
            Console Layout
            {children}
        </div>
    </SocketProvider>
  );
}
