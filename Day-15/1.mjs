import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 8081;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HTML_FILE_PATH = path.join(__dirname, 'index.html');

if (!fs.existsSync(HTML_FILE_PATH)) {
    const defaultHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Home Page</title>
        <style>
            body { font-family: sans-serif; text-align: center; margin-top: 100px; background: #eef2f3; }
            .box { background: white; display: inline-block; padding: 20px 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <div class="box">
            <h1>This is a Home Page</h1>
        </div>
    </body>
    </html>`;
    fs.writeFileSync(HTML_FILE_PATH, defaultHtml.trim());
}

// Create Server
const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(HTML_FILE_PATH, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Error');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});