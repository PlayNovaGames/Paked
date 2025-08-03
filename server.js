const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const buildsDir = path.join(__dirname, 'builds');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow CORS for your frontend
  next();
});

app.get('/latest-build', (req, res) => {
  fs.readdir(buildsDir, (err, files) => {
    if (err) return res.status(500).send('Could not read builds folder');

    // Filter only .html files
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    if (htmlFiles.length === 0) {
      return res.status(404).send('No builds available');
    }

    // Extract version numbers from filenames and sort descending
    const sortedFiles = htmlFiles.sort((a, b) => {
      const getVersion = (filename) => {
        // Example filename: "Paked V3.2.html"
        // Extract number after "V"
        const match = filename.match(/V(\d+(\.\d+)?)/);
        return match ? parseFloat(match[1]) : 0;
      };
      return getVersion(b) - getVersion(a);
    });

    const newestBuild = sortedFiles[0];
    const newestBuildPath = path.join(buildsDir, newestBuild);

    // Send the newest build file
    res.sendFile(newestBuildPath);
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
th