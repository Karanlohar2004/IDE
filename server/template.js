const fs = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');

const packageJson = {
  name: "sandbox-project",
  version: "1.0.0",
  description: "Browser-based developer sandbox candidate project",
  main: "server.js",
  scripts: {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  dependencies: {
    "express": "^4.19.2"
  }
};

const serverJs = `const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Serve user's custom workspace files statically (e.g. index.html)
app.use(express.static(__dirname));
// Fallback to template files
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/message', (req, res) => {
  res.json({
    message: "Hello from the Sandbox API!",
    timestamp: new Date().toISOString(),
    status: "healthy"
  });
});

app.listen(PORT, () => {
  console.log(\`Sandbox web server is listening on port \${PORT}\`);
  console.log(\`Open http://localhost:\${PORT} in the live preview to test.\`);
});
`;

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sandbox Live Preview</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #121214;
      color: #71717a;
      font-family: 'Fira Code', 'JetBrains Mono', monospace;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      text-align: center;
      box-sizing: border-box;
      padding: 20px;
    }
    p {
      max-width: 350px;
      font-size: 13px;
      line-height: 1.6;
      margin: 0;
    }
    code {
      color: #00e5ff;
      background-color: rgba(0, 229, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <p>No <code>index.html</code> found.<br>Create an <code>index.html</code> file in the file tree to preview your web project here.</p>
</body>
</html>
`;

async function initializeTemplate(userDir) {
  try {
    await fs.mkdir(userDir, { recursive: true });
    
    // Check if package.json already exists
    const pkgPath = path.join(userDir, 'package.json');
    try {
      await fs.access(pkgPath);
      console.log('Sandbox template already initialized.');
      return;
    } catch {
      // package.json doesn't exist, create files
      console.log('Initializing starter sandbox project files...');
      
      await fs.writeFile(pkgPath, JSON.stringify(packageJson, null, 2));
      await fs.writeFile(path.join(userDir, 'server.js'), serverJs);
      
      const publicDir = path.join(userDir, 'public');
      await fs.mkdir(publicDir, { recursive: true });
      await fs.writeFile(path.join(publicDir, 'index.html'), indexHtml);
      
      console.log('Sandbox template files created. Installing Express inside sandbox...');
      
      // Run npm install in sandbox directory to install express
      exec('npm install', { cwd: userDir }, (err, stdout, stderr) => {
        if (err) {
          console.error('Failed to run npm install in sandbox:', err);
        } else {
          console.log('Express installed in sandbox successfully.');
        }
      });
    }
  } catch (err) {
    console.error('Error during template initialization:', err);
  }
}

module.exports = { initializeTemplate };
