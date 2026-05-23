const http = require('http')
const express = require('express')
const fs = require('fs/promises')
const { Server: SocketServer } = require('socket.io')
const path = require('path')
const cors = require('cors')
const chokidar = require('chokidar')
const pty = require('node-pty')

const db = require('./db')
const { initializeTemplate } = require('./template')

// Establish database connection (MongoDB with JSON file fallback)
db.connectDb()

const userDir = path.join(__dirname, 'user')

// Initialize user directory with starter project template
initializeTemplate(userDir)

// Spawn PTY shell in the sandbox folder
const ptyProcess = pty.spawn('powershell.exe', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: userDir,
    env: process.env
})

const app = express()
const server = http.createServer(app)
const io = new SocketServer({
    cors: '*'
})

app.use(cors())
app.use(express.json()) // Essential for parsing JSON request bodies

io.attach(server)

// Watch files under userDir but ignore node_modules and .git for speed
chokidar.watch(userDir, {
    ignored: [/node_modules/, /\.git/]
}).on('all', (event, path) => {
    io.emit('file:refresh')
})

ptyProcess.onData(data => {
    io.emit('terminal:data', data)
})

io.on('connection', (socket) => {
    console.log(`Socket connected`, socket.id)

    socket.emit('file:refresh')

    socket.on('file:change', async ({ path: filePath, content }) => {
        try {
            const fullPath = path.join(userDir, filePath)
            await fs.writeFile(fullPath, content)
        } catch (err) {
            console.error('Socket file:change error:', err.message)
        }
    })

    socket.on('terminal:write', (data) => {
        ptyProcess.write(data)
    })

    socket.on('terminal:resize', ({ cols, rows }) => {
        try {
            ptyProcess.resize(cols, rows)
        } catch (err) {
            console.error('PTY resize error:', err.message)
        }
    })
})

// File tree list endpoint
app.get('/files', async (req, res) => {
    try {
        const fileTree = await generateFileTree(userDir)
        return res.json({ tree: fileTree })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

// Get file contents
app.get('/files/content', async (req, res) => {
    try {
        const filePath = req.query.path
        const fullPath = path.join(userDir, filePath)
        const content = await fs.readFile(fullPath, 'utf-8')
        return res.json({ content })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

// Create file/folder
app.post('/api/files/create', async (req, res) => {
    try {
        const { path: filePath, isFolder } = req.body
        if (!filePath) return res.status(400).json({ error: 'Path is required' })

        const fullPath = path.join(userDir, filePath)

        if (isFolder) {
            await fs.mkdir(fullPath, { recursive: true })
        } else {
            await fs.mkdir(path.dirname(fullPath), { recursive: true })
            await fs.writeFile(fullPath, '')
        }
        return res.json({ success: true })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

// Rename file/folder
app.post('/api/files/rename', async (req, res) => {
    try {
        const { oldPath, newPath } = req.body
        if (!oldPath || !newPath) return res.status(400).json({ error: 'oldPath and newPath are required' })

        const oldFullPath = path.join(userDir, oldPath)
        const newFullPath = path.join(userDir, newPath)

        await fs.mkdir(path.dirname(newFullPath), { recursive: true })
        await fs.rename(oldFullPath, newFullPath)
        return res.json({ success: true })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

// Delete file/folder
app.post('/api/files/delete', async (req, res) => {
    // Using POST for delete to keep requests simple
    try {
        const { path: filePath } = req.body
        if (!filePath) return res.status(400).json({ error: 'Path is required' })

        const fullPath = path.join(userDir, filePath)
        await fs.rm(fullPath, { recursive: true, force: true })
        return res.json({ success: true })
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

// Session state APIs
app.get('/api/session', async (req, res) => {
    try {
        const session = await db.getSession()
        return res.json(session)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

app.post('/api/session', async (req, res) => {
    try {
        const session = await db.saveSession(req.body)
        return res.json(session)
    } catch (err) {
        return res.status(500).json({ error: err.message })
    }
})

const { spawn } = require('child_process');

let sandboxProcess = null;

function startSandboxServer() {
    console.log('🚀 Starting user sandbox server on port 5000...');
    sandboxProcess = spawn('npx', ['nodemon', 'server.js'], {
        cwd: userDir,
        env: { ...process.env, PORT: 5000 },
        shell: true
    });

    sandboxProcess.stdout.on('data', (data) => {
        console.log(`[Sandbox Server]: ${data.toString().trim()}`);
    });

    sandboxProcess.stderr.on('data', (data) => {
        console.error(`[Sandbox Server Error]: ${data.toString().trim()}`);
    });

    sandboxProcess.on('close', (code) => {
        // If code is null, it was probably killed intentionally, we still want to keep it running
        console.log(`[Sandbox Server] Process exited with code ${code}. Restarting in 3 seconds...`);
        setTimeout(startSandboxServer, 3000);
    });
}

// Clean up child process on exit
const cleanUp = () => {
    if (sandboxProcess) {
        try {
            sandboxProcess.kill();
        } catch (err) {}
    }
};
process.on('exit', cleanUp);
process.on('SIGINT', () => {
    cleanUp();
    process.exit();
});
process.on('SIGTERM', () => {
    cleanUp();
    process.exit();
});

server.listen(9000, () => {
    console.log(`🐳 Sandbox API server running on port 9000`);
    startSandboxServer();
})

// Helper to generate file tree, optimized to avoid traversing node_modules and .git and to hide boilerplate files
async function generateFileTree(directory) {
    const tree = {}
    const boilerplate = ['node_modules', '.git', 'package.json', 'package-lock.json', 'server.js', 'public'];

    async function buildTree(currentDir, currentTree) {
        let files;
        try {
            files = await fs.readdir(currentDir)
        } catch {
            return;
        }

        for (const file of files) {
            // Ignore boilerplate/system files at the root level to keep workspace clean
            if (currentDir === directory && boilerplate.includes(file)) {
                continue;
            }

            const filePath = path.join(currentDir, file)
            let stat;
            try {
                stat = await fs.stat(filePath)
            } catch {
                continue;
            }

            if (stat.isDirectory()) {
                currentTree[file] = {}
                await buildTree(filePath, currentTree[file])
            } else {
                currentTree[file] = null
            }
        }
    }

    await buildTree(directory, tree)
    return tree
}