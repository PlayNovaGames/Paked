const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all origins

const buildsDir = path.join(__dirname, 'builds');

// Endpoint to get the list of builds sorted by modification time (latest first)
app.get('/builds', (req, res) => {
  fs.readdir(buildsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list builds' });

    // Filter HTML files only
    const buildFiles = files.filter(f => f.endsWith('.html'));

    // Map files to objects with stats for sorting
    const buildStats = buildFiles.map(file => {
      const stats = fs.statSync(path.join(buildsDir, file));
      return {
        filename: file,
        mtime: stats.mtime.getTime()
      };
    });

    // Sort by modification time descending
    buildStats.sort((a, b) => b.mtime - a.mtime);

    // Return just filenames sorted
    res.json(buildStats.map(b => b.filename));
  });
});

// Endpoint to get the latest build (the newest HTML file)
app.get('/latest-build', (req, res) => {
  fs.readdir(buildsDir, (err, files) => {
    if (err) return res.status(500).send('Failed to read builds directory');

    const buildFiles = files.filter(f => f.endsWith('.html'));
    if (buildFiles.length === 0) return res.status(404).send('No builds found');

    // Sort by modification time descending
    const buildStats = buildFiles.map(file => {
      const stats = fs.statSync(path.join(buildsDir, file));
      return {
        filename: file,
        mtime: stats.mtime.getTime()
      };
    }).sort((a, b) => b.mtime - a.mtime);

    const latestBuildPath = path.join(buildsDir, buildStats[0].filename);
    res.sendFile(latestBuildPath);
  });
});

// Serve specific build by filename
app.get('/builds/:buildName', (req, res) => {
  const buildName = req.params.buildName;
  const filePath = path.join(buildsDir, buildName);

  if (!filePath.startsWith(buildsDir)) {
    // Basic security check to prevent path traversal
    return res.status(400).send('Invalid build name');
  }

  fs.access(filePath, fs.constants.R_OK, err => {
    if (err) return res.status(404).send('Build not found');
    res.sendFile(filePath);
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
