const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const DATA_FILE = path.join(__dirname, 'data.json');

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);
  } else if (req.method === 'GET' && req.url === '/api/data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    try {
      fs.createReadStream(DATA_FILE).pipe(res);
    } catch {
      res.end(JSON.stringify({
        assets: {}, incomes: [], expenses: [],
        recurring: [], snapshots: [], creditCards: {}
      }));
    }
  } else if (req.method === 'POST' && req.url === '/api/data') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { JSON.parse(body); } catch { res.writeHead(400); return res.end('Invalid JSON'); }
      fs.writeFile(DATA_FILE, body, err => {
        if (err) { res.writeHead(500); return res.end('Write failed'); }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      });
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  const nets = require('os').networkInterfaces();
  let lanIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) { lanIP = net.address; break; }
    }
  }
  console.log(`\n  Finance app running:\n`);
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Phone:   http://${lanIP}:${PORT}\n`);
});
