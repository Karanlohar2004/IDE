# Browser-Based Coding Sandbox

A production-grade, high-fidelity browser-based developer assessment IDE. This project enables candidates to write, execute, install, and preview full-stack Node.js/Express projects live inside their browser with zero local setup.

---

## Architecture Overview

The system is built on a MERN stack (MongoDB, Express, React, Node.js) combined with WebSocket connection layers for real-time terminal shell simulation and file syncs.

### System Diagram

```
+--------------------------------------------------------------+
|                         React Client                         |
|                                                              |
|   +-------------------+  +--------------------------------+  |
|   |   File Explorer   |  |   Live Preview Panel (Iframe)  |  |
|   +-------------------+  +--------------------------------+  |
|   |   Tabs & Editor   |  |   Terminal Panel (Xterm.js)    |  |
|   +-------------------+  +--------------------------------+  |
+---------+-------------------+------------+-------------------+
          |                   |            |
          | HTTP APIs         | WebSocket  | HTTP Iframe Load
          v                   v            v
+-------------------+  +---------------------------------------+
|  Express Server   |  |            Socket.io Server           |
|                   |  |                                       |
|  - CRUD Actions   |  |  - Sync PTY process data              |
|  - Session state  |  |  - Debounced file change writing      |
+---------+---------+  +-------------------+-------------------+
          |                                |
          | Mongoose / JSON                | Write file / Spawn
          v                                v
+----------------------------+   +-----------------------------+
|    MongoDB / JSON File     |   |      node-pty Process       |
|    Session Persistence     |   |   (Powershell Sandbox CLI)  |
+----------------------------+   +-----------------------------+
```

### Key Subsystems

1. **Interactive File System CRUD**: React client sends HTTP REST calls to create, rename, and delete items. The changes immediately propagate to the backend's directory structure under `server/user` which triggers a watched Chokidar namespace broadcast, refreshing the tree reactively for all clients.
2. **Terminal Emulator**: An `xterm.js` interface running inside the client. Key events are piped to a native `node-pty` background process (spawning PowerShell in the candidate directory). A `ResizeObserver` is coupled with `@xterm/addon-fit` to translate terminal width resizes directly back to the active shell columns/rows configuration.
3. **Editor & Tabs System**: Features a multi-tab interface in the client with a 1.5-second debounced autosave, keyboard hooks (`Ctrl+S`), and active save state alerts.
4. **Live Preview Panel**: Mimics a standard browser view. It automatically runs a status checker that queries the specified local ports (e.g. 5000, 3000) and unlocks an active Iframe view when the sandboxed server comes online.
5. **Database Session Persistence**: Restores state using an Express router. Syncs active tabs and editor workspace paths. Employs Mongoose schemas but includes a JSON database fallback layer so that developer tools run smoothly without external databases.

---

## AI Usage Strategy & Leverage

To deliver this application with maximum speed and execution quality, we utilized:
1. **Iterative Component Architecting**: Prompted specialized subagents to construct modular units (e.g., separating the file navigation tree from editor tabs and the preview frame), keeping codebase complexity isolated.
2. **Incremental Context Checks**: Mapped the host environment dependencies before beginning development to identify which packages (like `@xterm/addon-fit` and `chokidar`) were already configured, minimizing redundant libraries.
3. **Automated Verification Loops**: Instructed the browser testing subagents to execute real end-to-end integration workflows (editing html, running terminal scripts, inspecting network responses) to ensure correct state synchrony.

---

## Technical Tradeoffs

*   **Shared PTY Process**: To keep implementation overhead light, a single shared PTY process is maintained globally by the server. In a production multi-tenant sandbox environment, each candidate session would spawn an isolated container (e.g., Docker or Firecracker) with dedicated networking and sandboxed process parameters.
*   **JSON Database Fallback**: Implemented a JSON local storage system that emulates the MongoDB Mongoose CRUD pattern. This offers instant out-of-the-box operation for graders/developers while maintaining standard MERN schemas.
*   **Iframe Sandbox Restrictions**: The Preview iframe is sandbox-restricted (`allow-scripts`, `allow-same-origin`) to prevent candidate code from accessing the main IDE window (e.g. CSRF or token theft).

---

## Known Limitations

1. **Host Terminal Shell**: The server spawns `powershell.exe` due to running on a Windows system. In a standard production deploy, this would spawn `bash` or `sh` inside a secure Linux microVM.
2. **Infinite Loops & Resource Exhaustion**: If a candidate runs a script with an infinite loop, it will consume host system resources. CPU limits and memory limits must be configured at the OS/Container level for public deployments.
3. **Port Conflict**: If multiple previews run on the same machine, they may collide. Production deployments typically route dynamically assigned ports through a reverse proxy.
