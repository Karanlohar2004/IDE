import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Terminal from "./components/terminal";
import FileTree from "./components/tree";
import PreviewPanel from "./components/PreviewPanel";
import socket from "./socket";
import AceEditor from "react-ace";

import { getFileMode } from "./utils/getFileMode";

// Ace Editor themes and modes
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

function App() {
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [code, setCode] = useState("");
  const [openTabs, setOpenTabs] = useState([]);
  const [saveStatus, setSaveStatus] = useState("Saved"); // Saved | Saving | Unsaved
  const [previewPort, setPreviewPort] = useState(5000);

  const isSaved = selectedFileContent === code;

  // Load Session state from the Database on mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/session`);
        if (response.ok) {
          const session = await response.json();
          if (session.openTabs && session.openTabs.length > 0) {
            setOpenTabs(session.openTabs);
          }
          if (session.activeFile) {
            setSelectedFile(session.activeFile);
          }
          if (session.previewPort) {
            setPreviewPort(session.previewPort);
          }
        }
      } catch (err) {
        console.warn("Failed to load persisted session state:", err.message);
      }
    };
    fetchSession();
  }, []);

  // Persist Session state to the Database on state change
  const persistSession = async (active, tabs, port) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activeFile: active,
          openTabs: tabs,
          previewPort: port,
        }),
      });
    } catch (err) {
      console.warn("Failed to persist session state:", err.message);
    }
  };

  // Immediate Save API
  const handleSave = useCallback(
    async (path, content) => {
      if (!path) return;
      setSaveStatus("Saving");
      socket.emit("file:change", {
        path,
        content,
      });
      setSelectedFileContent(content);
      setSaveStatus("Saved");
    },
    []
  );

  const handleRun = async () => {
    if (!selectedFile) return;
    
    // Save file if unsaved
    if (selectedFileContent !== code) {
      await handleSave(selectedFile, code);
    }

    const extension = selectedFile.split(".").pop().toLowerCase();
    const runPath = selectedFile.startsWith("/") ? selectedFile.substring(1) : selectedFile;
    
    let command = "";
    if (extension === "js" || extension === "jsx") {
      command = `node "${runPath}"`;
    } else if (extension === "py") {
      command = `python "${runPath}"`;
    } else if (extension === "java") {
      command = `java "${runPath}"`;
    }

    if (command) {
      // Send Ctrl+C first to clear active execution, then run command
      socket.emit("terminal:write", "\x03");
      setTimeout(() => {
        socket.emit("terminal:write", `${command}\r`);
      }, 250);
    }
  };

  // Ctrl+S Keyboard Shortcut for Saving
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (selectedFile) {
          handleSave(selectedFile, code);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedFile, code, handleSave]);

  // Debounced Autosave (1.5 seconds)
  useEffect(() => {
    if (selectedFile && !isSaved && code !== "") {
      setSaveStatus("Unsaved");
      const timer = setTimeout(() => {
        handleSave(selectedFile, code);
      }, 1500);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, selectedFile, isSaved, handleSave]);

  // Reset local state if active tab changes
  useEffect(() => {
    setCode("");
  }, [selectedFile]);

  useEffect(() => {
    setCode(selectedFileContent);
  }, [selectedFileContent]);

  // Fetch file tree list
  const getFileTree = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/files`);
      const result = await response.json();
      setFileTree(result.tree);
    } catch (err) {
      console.error("Error fetching file tree:", err);
    }
  };

  // Fetch active file contents
  const getFileContents = useCallback(async () => {
    if (!selectedFile) return;
    try {
      const response = await fetch(
       `${import.meta.env.VITE_API_URL}/files/content?path=${selectedFile}`
      );
      const result = await response.json();
      setSelectedFileContent(result.content);
      setSaveStatus("Saved");
    } catch (err) {
      console.error("Error fetching file content:", err);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile) {
      getFileContents();
    }
  }, [getFileContents, selectedFile]);

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    getFileTree();
    return () => {
      socket.off("file:refresh", getFileTree);
    };
  }, []);

  // Open file helper
  const handleFileSelect = (path) => {
    if (!openTabs.includes(path)) {
      const newTabs = [...openTabs, path];
      setOpenTabs(newTabs);
      persistSession(path, newTabs, previewPort);
    } else {
      persistSession(path, openTabs, previewPort);
    }
    setSelectedFile(path);
  };

  // Close tab helper
  const handleTabClose = (path, e) => {
    e.stopPropagation();

    // Warn if closing an unsaved file
    if (path === selectedFile && !isSaved) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Are you sure you want to close this file?"
      );
      if (!confirmClose) return;
    }

    const nextTabs = openTabs.filter((t) => t !== path);
    setOpenTabs(nextTabs);

    let nextActive = selectedFile;
    if (path === selectedFile) {
      nextActive = nextTabs.length > 0 ? nextTabs[nextTabs.length - 1] : "";
      setSelectedFile(nextActive);
    }
    persistSession(nextActive, nextTabs, previewPort);
  };

  return (
    <div className="flex h-screen w-screen bg-[#111112] text-[#e0e0e0] font-sans overflow-hidden">
      {/* Activity Bar (VS Code style - far left) */}
      <div className="w-[50px] bg-[#18181c] border-r border-[#2a2a2d] flex flex-col items-center py-4 justify-between select-none">
        <div className="flex flex-col items-center gap-6">
          <div className="text-cyan-400 p-2 cursor-pointer rounded-lg bg-[#252529] hover:text-cyan-300">
            {/* Explorer Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
            </svg>
          </div>
          <div className="text-gray-500 p-2 cursor-pointer hover:text-white transition-all">
            {/* Settings Icon */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          {/* User Status */}
          <div className="w-2.5 h-2.5 rounded-full bg-[#00ff88]" title="Database Connected" />
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - File Explorer */}
        <div className="w-[260px] bg-[#1a1a1f] border-r border-[#2a2a2d] flex flex-col select-none">
          <div className="flex-1 overflow-y-auto">
            <FileTree
              onSelect={handleFileSelect}
              tree={fileTree}
              onRefresh={getFileTree}
            />
          </div>
        </div>

        {/* Center Panel - Tabs & Code Editor */}
        <div className="flex-[1.2] flex flex-col bg-[#121214] border-r border-[#2a2a2d]">
          {/* Open Tabs Header */}
          <div className="flex bg-[#16161a] border-b border-[#2a2a2d] h-11 overflow-x-auto scrollbar-thin select-none">
            {openTabs.map((tab) => {
              const tabName = tab.split("/").pop();
              const isActive = tab === selectedFile;
              const isTabUnsaved = tab === selectedFile ? !isSaved : false; // For demo simplification

              return (
                <div
                  key={tab}
                  onClick={() => setSelectedFile(tab)}
                  className={`group flex items-center gap-2 px-4 py-2 border-r border-[#2a2a2d] cursor-pointer text-xs transition-all relative ${
                    isActive
                      ? "bg-[#121214] text-white border-t-2 border-cyan-400 font-semibold"
                      : "text-gray-400 hover:text-white hover:bg-[#1a1a1f]"
                  }`}
                >
                  <span>{tabName}</span>
                  {/* Close Tab Button */}
                  <button
                    onClick={(e) => handleTabClose(tab, e)}
                    className="p-0.5 rounded text-gray-500 hover:text-white hover:bg-[#2d2d30] cursor-pointer transition-all ml-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                  {/* Unsaved indicator dot */}
                  {isTabUnsaved && (
                    <span className="absolute bottom-1 right-2 w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Editor Header / Action bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#141416] border-b border-[#2a2a2d]">
            <div className="text-xs text-gray-400 font-mono flex items-center gap-1">
              {selectedFile ? (
                <>
                  <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span>{selectedFile.replaceAll("/", " > ")}</span>
                </>
              ) : (
                <span>No File Selected</span>
              )}
            </div>

            {/* Save Button & Status */}
            {selectedFile && (
              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                    saveStatus === "Saved"
                      ? "text-[#00ff88] bg-[#00ff88]/10"
                      : saveStatus === "Saving"
                      ? "text-amber-400 bg-amber-400/10 animate-pulse"
                      : "text-rose-500 bg-rose-500/10"
                  }`}
                >
                  {saveStatus}
                </span>
                
                {["js", "jsx", "py", "java"].includes(selectedFile.split(".").pop().toLowerCase()) && (
                  <button
                    onClick={handleRun}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs py-1.5 px-3 rounded shadow-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Run
                  </button>
                )}

                <button
                  onClick={() => handleSave(selectedFile, code)}
                  className="bg-cyan-500 hover:bg-cyan-600 text-black font-semibold text-xs py-1.5 px-3 rounded shadow-lg transition-all cursor-pointer"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden relative">
            {selectedFile ? (
              <AceEditor
                width="100%"
                height="100%"
                mode={getFileMode({ selectedFile })}
                theme="monokai"
                value={code}
                onChange={(e) => setCode(e)}
                fontSize={14}
                showPrintMargin={false}
                showGutter={true}
                highlightActiveLine={true}
                setOptions={{
                  enableBasicAutocompletion: true,
                  enableLiveAutocompletion: true,
                  enableSnippets: true,
                  showLineNumbers: true,
                  tabSize: 2,
                  useWorker: false, // Disables warnings work thread for simplicity
                }}
                editorProps={{ $blockScrolling: true }}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center select-none bg-[#111113]">
                <svg className="w-20 h-20 text-[#2a2a2d] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <h3 className="text-white font-semibold text-base mb-1">Welcome to the Sandbox</h3>
                <p className="max-w-xs text-xs text-gray-500">
                  Select a file from the explorer or create a new one to begin coding. Run npm scripts in the terminal to view changes.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Live Preview & Terminal (split vertically) */}
        <div className="flex-[1] flex flex-col bg-[#16161a] overflow-hidden">
          {/* Top Half - Live Preview */}
          <div className="flex-[1.2] min-h-[40%]">
            <PreviewPanel defaultPort={previewPort} />
          </div>

          {/* Bottom Half - Terminal */}
          <div className="flex-[0.8] flex flex-col border-t border-[#2a2a2d] bg-[#121214] min-h-[30%]">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#18181c] border-b border-[#2a2a2d] select-none">
              <span className="text-xs uppercase font-bold tracking-wider text-gray-400 font-mono">
                Terminal (Powershell)
              </span>
              <div className="flex items-center gap-2">
                {/* Visual indicator of terminal state */}
                <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                <span className="text-[10px] text-gray-500 font-mono uppercase">Connected</span>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <Terminal />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
