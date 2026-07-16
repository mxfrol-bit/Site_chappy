// Minimal zero-dependency production static server for the built SPA (dist/).
// Chosen over `serve`/`vite preview` so the deploy needs no extra dependency and
// no network install, with explicit SPA fallback + content types. Node built-ins only.
// Listens on $PORT (Railway injects it), falls back to 3000 locally.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = join(fileURLToPath(new URL('.', import.meta.url)), 'dist');
const PORT = process.env.PORT || 3000;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8', '.map': 'application/json', '.webmanifest': 'application/manifest+json',
};

const sendIndex = async (res) => {
  const html = await readFile(join(DIST, 'index.html'));
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end(html);
};

const server = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    let rel = normalize(url).replace(/^(\.\.[/\\])+/, ''); // block path traversal
    if (rel === '/' || rel === '') rel = '/index.html';
    const filePath = join(DIST, rel);
    const ext = extname(filePath);

    try {
      const s = await stat(filePath);
      const finalPath = s.isDirectory() ? join(filePath, 'index.html') : filePath;
      const finalExt = s.isDirectory() ? '.html' : ext;
      const data = await readFile(finalPath);
      res.writeHead(200, {
        'Content-Type': TYPES[finalExt] || 'application/octet-stream',
        'Cache-Control': finalExt === '.html' ? 'no-cache' : 'public, max-age=31536000',
      });
      res.end(data);
    } catch {
      // not found: SPA route (no file extension) -> index.html; real missing asset -> 404
      if (!ext) return void (await sendIndex(res));
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
    }
  } catch {
    try { await sendIndex(res); }
    catch { res.writeHead(500); res.end('Server error'); }
  }
});

server.listen(PORT, () => console.log(`chappy-web-prototype-v0.1 serving dist/ on :${PORT}`));
