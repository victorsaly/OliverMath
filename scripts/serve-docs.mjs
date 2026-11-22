// Serves docs/ the way GitHub Pages does, for `npm run preview` and the
// end-to-end tests: at the site's address (the root by default), with
// 404.html answering anything that has no file.
//
//   node scripts/serve-docs.mjs [--port 8100]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'docs');
const base = process.env.SITE_BASE || '/';
const portArg = process.argv.indexOf('--port');
const port = Number(portArg > -1 ? process.argv[portArg + 1] : process.env.PORT || 8100);

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
  '.wav': 'audio/wav', '.glb': 'model/gltf-binary', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8'
};

async function fileFor(urlPath) {
  const relative = decodeURIComponent(urlPath.slice(base.length));
  let file = path.join(root, relative);
  if (!file.startsWith(root)) return null;
  try {
    if ((await stat(file)).isDirectory()) file = path.join(file, 'index.html');
    await stat(file);
    return file;
  } catch {
    return null;
  }
}

createServer(async (request, response) => {
  const urlPath = new URL(request.url, 'http://localhost').pathname;
  if (!urlPath.startsWith(base)) {
    response.writeHead(302, { Location: base });
    response.end();
    return;
  }
  const file = await fileFor(urlPath);
  const served = file || path.join(root, '404.html');
  try {
    const body = await readFile(served);
    response.writeHead(file ? 200 : 404, { 'Content-Type': TYPES[path.extname(served)] || 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' });
    response.end('Not found. Run `npm run build` first.');
  }
}).listen(port, '0.0.0.0', () => {
  console.log(`Serving docs/ at http://localhost:${port}${base}`);
});
