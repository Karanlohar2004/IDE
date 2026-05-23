const express = require('express');
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
  console.log(`Sandbox web server is listening on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in the live preview to test.`);
});
