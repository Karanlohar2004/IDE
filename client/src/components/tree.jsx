import React, { useState } from "react";

// Expansion Chevron Icon
const ChevronIcon = ({ isOpen }) => (
  <svg 
    className={`w-3 h-3 text-gray-500 transition-transform duration-150 mr-1.5 flex-shrink-0 ${isOpen ? "rotate-90" : ""}`} 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
  </svg>
);

// Folder Icon with visual overlays representing directory types (VS Code style)
const FolderIcon = ({ folderName, isOpen }) => {
  const name = folderName.toLowerCase();
  
  if (name === 'src') {
    return (
      <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" className="text-orange-500" strokeWidth="3" d="M8 12l2-2-2-2m8 4l-2-2 2-2" />
      </svg>
    );
  }
  
  if (name === 'public') {
    return (
      <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        <circle cx="12" cy="13" r="2.5" className="fill-purple-500 stroke-none" />
      </svg>
    );
  }
  
  if (name === 'assets') {
    return (
      <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        <circle cx="10" cy="12" r="1.2" className="fill-cyan-400 stroke-none" />
        <circle cx="14" cy="12" r="1.2" className="fill-cyan-400 stroke-none" />
        <circle cx="12" cy="15" r="1.2" className="fill-cyan-400 stroke-none" />
      </svg>
    );
  }
  
  if (name === 'components') {
    return (
      <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" className="text-green-500" strokeWidth="3" d="M12 9l-3 3 3 3 3-3-3-3z" />
      </svg>
    );
  }
  
  if (name === 'utils') {
    return (
      <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" className="text-purple-400" strokeWidth="3" d="M10 15l4-4m-2 4a1.5 1.5 0 112-2" />
      </svg>
    );
  }

  // Fallback default folder
  return (
    <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {isOpen ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      )}
    </svg>
  );
};

// File Icons matching the colors and shapes of the reference image
const FileIcon = ({ fileName }) => {
  const ext = fileName.split('.').pop().toLowerCase();
  
  if (ext === 'js') {
    return (
      <span className="text-[9px] font-extrabold text-yellow-500 mr-2 flex-shrink-0 bg-yellow-500/10 px-0.5 rounded border border-yellow-500/20 leading-none py-0.5 font-sans">
        JS
      </span>
    );
  }
  
  if (ext === 'jsx') {
    return (
      <svg className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(90 12 12)" />
        <ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(150 12 12)" />
        <circle cx="12" cy="12" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (ext === 'css') {
    return (
      <svg className="w-4 h-4 text-sky-400 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3H7a2 2 0 00-2 2v5a2 2 0 01-2 2 2 2 0 012 2v5a2 2 0 002 2h1" />
        <path d="M16 3h1a2 2 0 012 2v5a2 2 0 002 2 2 2 0 00-2 2v5a2 2 0 01-2 2h-1" />
      </svg>
    );
  }

  if (ext === 'html') {
    return (
      <svg className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 17l-5-5 5-5m4 10l5-5-5-5" />
      </svg>
    );
  }

  if (ext === 'json') {
    return (
      <span className="text-[8px] font-bold text-amber-500 mr-2 flex-shrink-0 bg-amber-500/10 px-0.5 rounded border border-amber-500/20 leading-none py-0.5 font-sans">
        {}
      </span>
    );
  }

  if (fileName === '.gitignore') {
    return (
      <svg className="w-4 h-4 text-rose-500 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 10.85L13.15 5.1a1.64 1.64 0 00-2.3 0l-1.3 1.3 2.8 2.8a1.65 1.65 0 011.8.3 1.65 1.65 0 01.3 1.8l2.8 2.8a1.66 1.66 0 11-1.4 1.4v-3l-2.8-2.8a1.67 1.67 0 01-2 .1v4.1a1.66 1.66 0 11-1.4 0v-5.6a1.66 1.66 0 011-1.5l2.4-2.4a1.64 1.64 0 000-2.3L5.1 11.2a1.64 1.64 0 000 2.3l5.75 5.75c.6.6 1.7.6 2.3 0l5.75-5.75a1.64 1.64 0 000-2.35z"/>
      </svg>
    );
  }

  if (ext === 'java') {
    return (
      <svg className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a2 2 0 012 2v2a2 2 0 01-2 2h-1" />
        <path d="M4 8h14v6a4 4 0 01-4 4H8a4 4 0 01-4-4V8z" />
        <path d="M6 2h1M10 2h1M14 2h1M6 21h12" />
      </svg>
    );
  }

  if (ext === 'py') {
    return (
      <span className="text-[9px] font-extrabold text-sky-400 mr-2 flex-shrink-0 bg-sky-500/10 px-0.5 rounded border border-sky-500/20 leading-none py-0.5 font-sans">
        PY
      </span>
    );
  }

  // Default File Page sheet
  return (
    <svg className="w-4 h-4 text-slate-500 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
};

const FileTreeNode = ({ fileName, nodes, onSelect, path, onRefresh }) => {
  const isDir = !!nodes;
  const [isOpen, setIsOpen] = useState(true);

  const toggleOpen = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    if (isDir) {
      toggleOpen(e);
    } else {
      onSelect(path);
    }
  };

  const handleCreate = async (e, isFolder) => {
    e.stopPropagation();
    const typeLabel = isFolder ? "folder" : "file";
    const name = window.prompt(`Enter name for new ${typeLabel}:`);
    if (!name) return;

    const newPath = path + "/" + name;
    try {
      const response = await fetch("http://localhost:9000/api/files/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: newPath, isFolder })
      });
      if (response.ok) {
        setIsOpen(true);
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to create " + typeLabel);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRename = async (e) => {
    e.stopPropagation();
    const newName = window.prompt(`Rename "${fileName}" to:`, fileName);
    if (!newName || newName === fileName) return;

    const pathParts = path.split("/");
    pathParts[pathParts.length - 1] = newName;
    const newPath = pathParts.join("/");

    try {
      const response = await fetch("http://localhost:9000/api/files/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPath: path, newPath })
      });
      if (response.ok) {
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to rename");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Are you sure you want to delete "${fileName}"?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch("http://localhost:9000/api/files/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path })
      });
      if (response.ok) {
        if (onRefresh) onRefresh();
      } else {
        alert("Failed to delete item");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="select-none text-xs font-mono">
      {/* Node Header Row */}
      <div
        onClick={handleSelect}
        className="group flex items-center justify-between py-1 px-1.5 rounded hover:bg-[#2d2d30]/60 cursor-pointer text-gray-300 hover:text-white transition-all"
      >
        <div className="flex items-center flex-1 min-w-0">
          {isDir ? (
            <>
              <ChevronIcon isOpen={isOpen} />
              <FolderIcon folderName={fileName} isOpen={isOpen} />
            </>
          ) : (
            <>
              {/* spacer matching width of chevron (w-3 + mr-1.5 = 18px total) */}
              <div className="w-[18px] flex-shrink-0" />
              <FileIcon fileName={fileName} />
            </>
          )}
          <span className="truncate">{fileName}</span>
        </div>

        {/* Hover Action Buttons */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity pl-2">
          {isDir && (
            <>
              <button
                onClick={(e) => handleCreate(e, false)}
                className="p-0.5 hover:text-cyan-400 rounded hover:bg-[#3d3d40] text-gray-400 transition-all cursor-pointer"
                title="New File"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
              <button
                onClick={(e) => handleCreate(e, true)}
                className="p-0.5 hover:text-cyan-400 rounded hover:bg-[#3d3d40] text-gray-400 transition-all cursor-pointer"
                title="New Folder"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                </svg>
              </button>
            </>
          )}
          {path !== "" && (
            <>
              <button
                onClick={handleRename}
                className="p-0.5 hover:text-cyan-400 rounded hover:bg-[#3d3d40] text-gray-400 transition-all cursor-pointer"
                title="Rename"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                onClick={handleDelete}
                className="p-0.5 hover:text-rose-500 rounded hover:bg-[#3d3d40] text-gray-400 transition-all cursor-pointer"
                title="Delete"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Children list - visually nested with a guideline */}
      {isDir && isOpen && (
        <ul className="ml-[16px] border-l border-zinc-700/60 pl-3 mt-0.5 space-y-0.5">
          {Object.keys(nodes)
            .sort((a, b) => {
              const aIsDir = nodes[a] !== null;
              const bIsDir = nodes[b] !== null;
              if (aIsDir && !bIsDir) return -1;
              if (!aIsDir && bIsDir) return 1;
              return a.localeCompare(b);
            })
            .map((child) => (
              <li key={child}>
                <FileTreeNode
                  onSelect={onSelect}
                  path={path + "/" + child}
                  fileName={child}
                  nodes={nodes[child]}
                  onRefresh={onRefresh}
                />
              </li>
            ))}
        </ul>
      )}
    </div>
  );
};

const FileTree = ({ tree, onSelect, onRefresh }) => {
  return (
    <div className="w-full h-full text-gray-300 py-2 px-1">
      {/* Root Header */}
      <div className="flex items-center justify-between px-2 mb-2 font-bold text-xs uppercase tracking-wider text-gray-500 select-none">
        <span>Files</span>
        <div className="flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const name = window.prompt("Enter file name for project root:");
              if (!name) return;
              fetch("http://localhost:9000/api/files/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: "/" + name, isFolder: false })
              }).then(res => res.ok && onRefresh && onRefresh());
            }}
            className="hover:text-white p-0.5 cursor-pointer"
            title="Create root file"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const name = window.prompt("Enter folder name for project root:");
              if (!name) return;
              fetch("http://localhost:9000/api/files/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ path: "/" + name, isFolder: true })
              }).then(res => res.ok && onRefresh && onRefresh());
            }}
            className="hover:text-white p-0.5 cursor-pointer"
            title="Create root folder"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-140px)]">
        {tree && Object.keys(tree).length > 0 ? (
          Object.keys(tree)
            .sort((a, b) => {
              const aIsDir = tree[a] !== null;
              const bIsDir = tree[b] !== null;
              if (aIsDir && !bIsDir) return -1;
              if (!aIsDir && bIsDir) return 1;
              return a.localeCompare(b);
            })
            .map((child) => (
              <FileTreeNode
                key={child}
                onSelect={onSelect}
                path={"/" + child}
                fileName={child}
                nodes={tree[child]}
                onRefresh={onRefresh}
              />
            ))
        ) : (
          <div className="text-center text-xs text-gray-500 py-4 font-mono">
            Empty project directory
          </div>
        )}
      </div>
    </div>
  );
};

export default FileTree;