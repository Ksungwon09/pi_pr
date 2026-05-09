const fs = require('fs');
const https = require('https');

const path = require('path');

// Target file path
const targetPath = path.join(__dirname, 'pi-10m.txt');

// A reliable source for 10 million digits of Pi
// Using introcs from Princeton as we tested earlier it works and is fast
const url = 'https://introcs.cs.princeton.edu/java/data/pi-10million.txt';

// Only download if it doesn't already exist
if (fs.existsSync(targetPath)) {
    console.log('pi-10m.txt already exists. Skipping download.');
    process.exit(0);
}

console.log('Downloading 10M digits of Pi from', url, '...');

https.get(url, (res) => {
    if (res.statusCode === 200) {
        const file = fs.createWriteStream(targetPath);
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Download complete!');
        });
    } else {
        console.error('Failed to download:', res.statusCode);
    }
}).on('error', (err) => {
    console.error('Error:', err.message);
});
