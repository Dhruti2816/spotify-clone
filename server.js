const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

const songFolder = path.join(__dirname, 'songs');

app.use('/songs', express.static(songFolder));

// ✅ Ensure API returns JSON instead of HTML
app.get('/songs/:folder', (req, res) => {
  const folderPath = path.join(__dirname, 'songs', req.params.folder); // ✅ Fixed path


    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to scan directory' });
        }

        const songs = files
            .filter(file => file.endsWith('.mp3'))
            .map(file => ({ name: file }));

        res.json(songs); // ✅ Send JSON response
    });
});

app.listen(PORT, () => {
    console.log(`Server is running at http://127.0.0.1:${PORT}`);
});

