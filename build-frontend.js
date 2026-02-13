const { getHTML } = require('./src/frontend.js');
const fs = require('fs');

const html = getHTML({});

// Replace all relative API calls with the deployed Cloudflare Worker URL
const WORKER_URL = 'https://akanator.modmojheh.workers.dev';

let fixed = html;
// Replace fetch('/api/...' with fetch('WORKER_URL/api/...'
fixed = fixed.replace(/fetch\('\/api\//g, `fetch('${WORKER_URL}/api/`);
// Replace fetch(`/api/... with fetch(`WORKER_URL/api/...
fixed = fixed.replace(/fetch\(`\/api\//g, `fetch(\`${WORKER_URL}/api/`);
// Replace fetch("/api/... with fetch("WORKER_URL/api/...
fixed = fixed.replace(/fetch\("\/api\//g, `fetch("${WORKER_URL}/api/`);

// Replace logo path for GitHub Pages (local file in docs/)
fixed = fixed.replace(/src="\/assets\/logo\.png"/g, 'src="logo.png"');
fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync('docs/index.html', fixed);
console.log('Created docs/index.html -', fixed.length, 'bytes');

// Verify replacements
const apiCalls = fixed.match(/fetch\([`'"]/g);
console.log('Total fetch calls:', apiCalls ? apiCalls.length : 0);
const remaining = fixed.match(/fetch\(['"`]\/api/g);
console.log('Remaining relative /api calls:', remaining ? remaining.length : 0);
