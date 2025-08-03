const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const serveIndex = require('serve-index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all origins

const buildsDir = path.join(__dirname, 'builds');

// Serve builds folder statically with directory listing (optional)
app.use('/builds', express.static(buildsDir), serveIndex(buildsDir, { icons: true }));

// Endpoint to get the latest build HTML
app.get('/latest-build', (req, res) => {
  fs.readdir(buildsDir, (err, files) => {
    if (err) {
      console.error('Error reading builds directory:', err);
      return res.status(500).send('Server error');
    }

    // Filter for .html files only
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    if (htmlFiles.length === 0) {
      return res.status(404).send('No builds found');
    }

    // Get file info for all HTML files to find the newest by modified time
    let newestFile = null;
    let newestMTime = 0;

    htmlFiles.forEach(file => {
      const filePath = path.join(buildsDir, file);
      const stats = fs.statSync(filePath);
      if (stats.mtimeMs > newestMTime) {
        newestMTime = stats.mtimeMs;
        newestFile = filePath;
      }
    });

    // Send the newest build HTML file content
    res.sendFile(newestFile);
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Serving builds from: ${buildsDir}`);
});
