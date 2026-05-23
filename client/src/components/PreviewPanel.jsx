import React, { useState, useEffect, useRef } from "react";

const PreviewPanel = ({ defaultPort = 5000 }) => {
  const [port, setPort] = useState(defaultPort);
  const [url, setUrl] = useState(`http://localhost:${defaultPort}`);
  const [iframeKey, setIframeKey] = useState(0);
  const [status, setStatus] = useState("checking"); // checking | online | offline
  const iframeRef = useRef(null);

  // Sync internal state if defaultPort changes
  useEffect(() => {
    setPort(defaultPort);
    setUrl(`http://localhost:${defaultPort}`);
  }, [defaultPort]);

  // Check if server is running on the specified port
  useEffect(() => {
    let active = true;
    const checkServer = async () => {
      setStatus("checking");
      try {
        // Use a simple fetch with a short timeout to check if the port is open
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        
        await fetch(`http://localhost:${port}/`, {
          mode: 'no-cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        if (active) setStatus("online");
      } catch (err) {
        if (active) setStatus("offline");
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 5000); // Check status every 5s

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [port]);

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handlePortChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val) {
      setPort(parseInt(val, 10));
      setUrl(`http://localhost:${val}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#151515] border border-[#2d2d2d] rounded-lg overflow-hidden shadow-2xl">
      {/* Browser Toolbar Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-[#1a1a1a] border-b border-[#2d2d2d] select-none">
        {/* Mock Browser Dots */}
        <div className="flex gap-1.5 mr-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        </div>

        {/* Reload Button */}
        <button
          onClick={handleReload}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2d2d2d] rounded transition-all cursor-pointer"
          title="Reload preview"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
          </svg>
        </button>

        {/* Address Bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] border border-[#2d2d2d] rounded-md text-xs text-gray-300">
          <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          <span className="select-all overflow-hidden text-ellipsis whitespace-nowrap text-gray-400">
            http://localhost:
          </span>
          <input
            type="text"
            value={port}
            onChange={handlePortChange}
            className="w-16 bg-transparent text-white font-mono focus:outline-none focus:border-b focus:border-cyan-400"
            title="Edit preview port"
          />
          <div className="ml-auto flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${
              status === "online" ? "bg-[#00ff88]" :
              status === "checking" ? "bg-amber-400 animate-pulse" : "bg-rose-500"
            }`} />
            <span className="text-[10px] text-gray-500 uppercase font-semibold">
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Browser Screen / Iframe Container */}
      <div className="flex-1 bg-white relative">
        {status === "offline" && (
          <div className="absolute inset-0 bg-[#121214] flex flex-col items-center justify-center p-6 text-center text-gray-400 z-10">
            <svg className="w-16 h-16 text-rose-500/30 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3 className="text-white font-semibold text-lg mb-1">Server Offline</h3>
            <p className="max-w-xs text-sm text-gray-500 mb-4">
              The project is not running on port <code className="text-cyan-400 font-mono">{port}</code> yet. Run a server command in the terminal to view it live!
            </p>
            <div className="text-xs bg-[#1a1a1c] border border-[#2d2d2f] text-gray-400 p-2.5 rounded-md font-mono">
              e.g. <span className="text-cyan-400">npm start</span> or <span className="text-cyan-400">node server.js</span>
            </div>
          </div>
        )}
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={url}
          title="Sandbox Live Preview"
          className="w-full h-full border-none bg-white"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </div>
  );
};

export default PreviewPanel;
