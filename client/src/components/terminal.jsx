import { Terminal as XTerminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { useEffect, useRef } from "react";
import socket from "../socket";

import "@xterm/xterm/css/xterm.css";

const Terminal = () => {
  const terminalRef = useRef();
  const terminalInstance = useRef(null);
  const fitAddonInstance = useRef(null);

  useEffect(() => {
    // Create new Terminal instance
    const term = new XTerminal({
      rows: 15,
      cursorBlink: true,
      theme: {
        background: "#121214",
        foreground: "#f1f1f1",
        cursor: "#00e5ff",
        selectionBackground: "rgba(0, 229, 255, 0.3)",
        black: "#000000",
        red: "#ff5555",
        green: "#50fa7b",
        yellow: "#f1fa8c",
        blue: "#bd93f9",
        magenta: "#ff79c6",
        cyan: "#8be9fd",
        white: "#bfbfbf"
      },
      fontSize: 14,
      fontFamily: "'Fira Code', 'JetBrains Mono', monospace"
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(terminalRef.current);
    fitAddon.fit();

    terminalInstance.current = term;
    fitAddonInstance.current = fitAddon;

    // Send keystrokes to server
    term.onData((data) => {
      socket.emit("terminal:write", data);
    });

    // Receive output from server
    function onTerminalData(data) {
      term.write(data);
    }

    socket.on("terminal:data", onTerminalData);

    // Initial resize sync
    const dimensions = fitAddon.proportionalDimensions;
    if (dimensions) {
      socket.emit("terminal:resize", {
        cols: term.cols,
        rows: term.rows
      });
    }

    // Set up ResizeObserver to auto-fit terminal layout
    const resizeObserver = new ResizeObserver(() => {
      if (fitAddonInstance.current && terminalInstance.current) {
        try {
          fitAddonInstance.current.fit();
          socket.emit("terminal:resize", {
            cols: terminalInstance.current.cols,
            rows: terminalInstance.current.rows
          });
        } catch (err) {
          console.warn("Resize PTY error:", err);
        }
      }
    });

    if (terminalRef.current) {
      resizeObserver.observe(terminalRef.current);
    }

    return () => {
      socket.off("terminal:data", onTerminalData);
      resizeObserver.disconnect();
      term.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#121214] p-2 overflow-hidden rounded-b-lg">
      <div ref={terminalRef} className="w-full h-full" id="terminal" />
    </div>
  );
};

export default Terminal;