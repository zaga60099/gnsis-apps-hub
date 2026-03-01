const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT_HTTP = 3200;
const PORT_HTTPS = 3201;

// Permitir iframe desde Monday.com
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.removeHeader('X-Frame-Options');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Security-Policy', "frame-ancestors *");
  next();
});

// Servir archivos estáticos
app.use(express.static(path.join(__dirname)));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'GNSIS Apps Hub',
    https: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// HTTP server
http.createServer(app).listen(PORT_HTTP, () => {
  console.log(`HTTP activo en http://localhost:${PORT_HTTP}`);
});

// HTTPS server
try {
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'cert.key')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.crt')),
    ca: fs.readFileSync(path.join(__dirname, 'ca.crt'))
  };
  https.createServer(sslOptions, app).listen(PORT_HTTPS, () => {
    console.log(`HTTPS activo en https://localhost:${PORT_HTTPS}`);
  });
} catch (e) {
  console.log('HTTPS no disponible:', e.message);
}
