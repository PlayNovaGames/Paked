const express = require("express");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;
const latestVersion = "Paked V3.0";

// Serve static files in the builds directory
app.use("/builds", express.static(path.join(__dirname, "builds")));

// Route to get the latest build metadata
app.get("/latest-version", (req, res) => {
  res.json({ version: latestVersion });
});

// Route to get the HTML of the latest version
app.get("/latest-build", (req, res) => {
  res.sendFile(path.join(__dirname, "builds", `${latestVersion}.html`));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});