/**
 * Production Server for cPanel Deployment
 * 
 * This file is used as the entry point when deploying to cPanel hosting.
 * It creates a custom Node.js HTTP server that handles Next.js requests.
 * 
 * Usage:
 * - In cPanel Node.js App Manager, set this as the "Application Startup File"
 * - Ensure NODE_ENV=production is set
 * - Port is typically assigned by cPanel (default: 3000)
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Environment configuration
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js application
const app = next({ 
  dev, 
  hostname, 
  port,
  // Ensure Next.js uses the correct directory for static files
  dir: __dirname
});

const handle = app.getRequestHandler();

console.log(`[${new Date().toISOString()}] Initializing Next.js application...`);
console.log(`Environment: ${dev ? 'development' : 'production'}`);
console.log(`Port: ${port}`);
console.log(`Hostname: ${hostname}`);

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Parse request URL
      const parsedUrl = parse(req.url, true);
      
      // Handle the request with Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] Error occurred handling`, req.url, err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  })
    .once('error', (err) => {
      console.error(`[${new Date().toISOString()}] Server error:`, err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`[${new Date().toISOString()}] > Server ready on http://${hostname}:${port}`);
      console.log(`[${new Date().toISOString()}] > Next.js application started successfully`);
    });
}).catch((err) => {
  console.error(`[${new Date().toISOString()}] Failed to start server:`, err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] SIGTERM signal received: closing HTTP server`);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] SIGINT signal received: closing HTTP server`);
  process.exit(0);
});
